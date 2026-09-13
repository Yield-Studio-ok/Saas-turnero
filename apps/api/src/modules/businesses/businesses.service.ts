import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FirebaseService } from "../auth/firebase.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";

@Injectable()
export class BusinessesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  async create(firebaseUid: string, email: string, createBusinessDto: CreateBusinessDto) {
    let user = await this.prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await this.prisma.user.update({
          where: { email },
          data: { firebaseUid, role: "owner" },
        });
      } else {
        user = await this.prisma.user.create({ data: { firebaseUid, email, role: "owner" } });
      }
    }
    const business = await this.prisma.business.create({
      data: { ...createBusinessDto, ownerId: user.id },
    });

    if (this.firebase.isEnabled()) {
      try {
        await this.firebase.setRole(firebaseUid, "owner", business.id);
        const db = this.firebase.getFirestore();
        await db.collection("tenants").doc(business.id).set(
          {
            id: business.id,
            name: business.name,
            description: business.description,
            ownerId: business.ownerId,
            createdAt: business.createdAt.toISOString(),
            updatedAt: business.updatedAt.toISOString(),
          },
          { merge: true },
        );
      } catch (e) {
        console.error("Failed to set firebase role or sync tenant", e);
      }
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role: "owner" },
      });
    }

    return business;
  }

  async getProfile(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException("Business not found");
    return business;
  }

  async updateProfile(businessId: string, ownerId: string, updateBusinessDto: UpdateBusinessDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException("Business not found");
    if (business.ownerId !== ownerId) throw new ForbiddenException("You do not own this business");

    const updated = await this.prisma.business.update({
      where: { id: businessId },
      data: updateBusinessDto,
    });

    if (this.firebase.isEnabled()) {
      try {
        const db = this.firebase.getFirestore();
        await db
          .collection("tenants")
          .doc(businessId)
          .set(
            {
              ...updateBusinessDto,
              updatedAt: updated.updatedAt.toISOString(),
            },
            { merge: true },
          );
      } catch (e) {
        console.error("Failed to sync tenant update to Firestore", e);
      }
    }

    return updated;
  }

  /**
   * Public query: fetches tenant profile and services subcollection from Firestore.
   * Supports identifier as tenant document ID, slug, or name.
   * Falls back to database (Prisma) if Firestore is not configured or document is not found.
   */
  async getPublicProfile(identifier: string) {
    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      throw new BadRequestException("A valid tenant ID or slug is required");
    }

    const trimmedIdentifier = identifier.trim();

    // 1. Fetch from Firestore if Firebase is enabled
    if (this.firebase.isEnabled()) {
      try {
        const db = this.firebase.getFirestore();
        let tenantDoc: any = null;

        // Try direct lookup by document ID in 'tenants' collection
        const directDoc = await db.collection("tenants").doc(trimmedIdentifier).get();
        if (directDoc && directDoc.exists) {
          tenantDoc = directDoc;
        } else {
          // Try lookup by slug
          const slugSnap = await db
            .collection("tenants")
            .where("slug", "==", trimmedIdentifier)
            .limit(1)
            .get();

          if (slugSnap && !slugSnap.empty) {
            tenantDoc = slugSnap.docs[0];
          } else {
            // Try lookup by name
            const nameSnap = await db
              .collection("tenants")
              .where("name", "==", trimmedIdentifier)
              .limit(1)
              .get();

            if (nameSnap && !nameSnap.empty) {
              tenantDoc = nameSnap.docs[0];
            }
          }
        }

        if (tenantDoc && tenantDoc.exists) {
          const tenantId = tenantDoc.id;
          const tenantData = tenantDoc.data() || {};

          // Fetch subcollection 'services': /tenants/{tenantId}/services
          const servicesSnap = await db
            .collection("tenants")
            .doc(tenantId)
            .collection("services")
            .get();

          const services: Array<Record<string, any>> = [];
          if (servicesSnap && servicesSnap.docs) {
            servicesSnap.docs.forEach((doc: any) => {
              services.push({
                id: doc.id,
                ...doc.data(),
              });
            });
          }

          // Fallback: check root 'services' collection if subcollection was empty
          if (services.length === 0) {
            const rootServicesSnap = await db
              .collection("services")
              .where("businessId", "==", tenantId)
              .get();

            if (rootServicesSnap && rootServicesSnap.docs) {
              rootServicesSnap.docs.forEach((doc: any) => {
                services.push({
                  id: doc.id,
                  ...doc.data(),
                });
              });
            }
          }

          // Fallback: check Prisma services if still empty
          if (services.length === 0) {
            try {
              const prismaServices = await this.prisma.service.findMany({
                where: { businessId: tenantId },
              });
              if (prismaServices && prismaServices.length > 0) {
                services.push(
                  ...prismaServices.map((s) => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || "",
                    duration: s.duration,
                    price: s.price,
                    category: "General",
                  })),
                );
              }
            } catch {
              // Ignore prisma error
            }
          }

          const resolvedSlug =
            tenantData.slug ||
            (tenantData.name
              ? tenantData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
              : tenantId);

          const profile = {
            ...tenantData,
            id: tenantId,
            name: tenantData.name || trimmedIdentifier,
            slug: resolvedSlug,
            description: tenantData.description || tenantData.tagline || "",
            tagline: tenantData.tagline || tenantData.description || "",
            address: tenantData.address || "",
            phone: tenantData.phone || "",
            openHours: tenantData.openHours || "09:00 - 20:00",
            rating: typeof tenantData.rating === "number" ? tenantData.rating : 5.0,
            reviewCount: typeof tenantData.reviewCount === "number" ? tenantData.reviewCount : 0,
            isOpen: typeof tenantData.isOpen === "boolean" ? tenantData.isOpen : true,
            services,
            business: {
              ...tenantData,
              id: tenantId,
              name: tenantData.name || trimmedIdentifier,
              slug: resolvedSlug,
              description: tenantData.description || tenantData.tagline || "",
              tagline: tenantData.tagline || tenantData.description || "",
              address: tenantData.address || "",
              phone: tenantData.phone || "",
              openHours: tenantData.openHours || "09:00 - 20:00",
              rating: typeof tenantData.rating === "number" ? tenantData.rating : 5.0,
              reviewCount: typeof tenantData.reviewCount === "number" ? tenantData.reviewCount : 0,
              isOpen: typeof tenantData.isOpen === "boolean" ? tenantData.isOpen : true,
            },
            tenant: {
              ...tenantData,
              id: tenantId,
              name: tenantData.name || trimmedIdentifier,
              slug: resolvedSlug,
            },
          };

          return profile;
        }
      } catch (err) {
        console.warn("Firestore fetch public profile failed, falling back to database:", err);
      }
    }

    // 2. Database (Prisma) fallback if not found in Firestore or Firestore disabled
    const business = await this.prisma.business.findFirst({
      where: {
        OR: [{ id: trimmedIdentifier }, { name: trimmedIdentifier }],
      },
      include: {
        services: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Tenant or Business '${trimmedIdentifier}' not found`);
    }

    const { services = [], ...businessData } = business;
    const resolvedSlug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return {
      ...businessData,
      id: business.id,
      name: business.name,
      slug: resolvedSlug,
      description: business.description || "",
      tagline: business.description || "",
      address: "",
      phone: "",
      openHours: "09:00 - 20:00",
      rating: 5.0,
      reviewCount: 0,
      isOpen: true,
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        duration: s.duration,
        price: s.price,
        category: (s as any).category || "General",
      })),
      business: {
        ...businessData,
        id: business.id,
        name: business.name,
        slug: resolvedSlug,
        description: business.description || "",
        tagline: business.description || "",
        address: "",
        phone: "",
        openHours: "09:00 - 20:00",
        rating: 5.0,
        reviewCount: 0,
        isOpen: true,
      },
      tenant: {
        ...businessData,
        id: business.id,
        name: business.name,
        slug: resolvedSlug,
      },
    };
  }

  async getAnalytics(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) throw new NotFoundException("Business not found");

    const now = new Date();
    const currentMonthStr = now.toISOString().slice(0, 7);

    const revenueResult = await this.prisma.appointment.aggregate({
      where: {
        businessId,
        status: "COMPLETED",
        date: { startsWith: currentMonthStr },
      },
      _sum: { paidAmount: true },
    });
    const totalRevenue = revenueResult._sum.paidAmount || 0;

    const statusCounts = await this.prisma.appointment.groupBy({
      by: ["status"],
      where: { businessId, date: { startsWith: currentMonthStr } },
      _count: { id: true },
    });

    let totalAppointments = 0;
    let noShowAppointments = 0;
    statusCounts.forEach((group) => {
      totalAppointments += group._count.id;
      if (group.status === "NO_SHOW") noShowAppointments = group._count.id;
    });

    const absenteeismRate =
      totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

    return { totalRevenue, absenteeismRate, totalAppointments, noShowAppointments };
  }

  async getPublicServices(identifier: string) {
    const profile = await this.getPublicProfile(identifier);
    return profile.services;
  }

  async getDirectory() {
    if (this.firebase.isEnabled()) {
      try {
        const db = this.firebase.getFirestore();
        const tenantsSnap = await db.collection("tenants").get();
        const results = [];
        for (const doc of tenantsSnap.docs) {
          const tenantData = doc.data();
          const tenantId = doc.id;
          
          let services = [];
          try {
            const servicesSnap = await db.collection("tenants").doc(tenantId).collection("services").get();
            servicesSnap.forEach(sDoc => {
              services.push({ id: sDoc.id, ...sDoc.data() });
            });
          } catch (e) {}
          
          const resolvedSlug = tenantData.slug || (tenantData.name ? tenantData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : tenantId);
          
          results.push({
            ...tenantData,
            id: tenantId,
            name: tenantData.name || "Unknown",
            slug: resolvedSlug,
            description: tenantData.description || tenantData.tagline || "",
            tagline: tenantData.tagline || tenantData.description || "",
            rating: typeof tenantData.rating === "number" ? tenantData.rating : 5.0,
            reviewCount: typeof tenantData.reviewCount === "number" ? tenantData.reviewCount : 0,
            isOpen: typeof tenantData.isOpen === "boolean" ? tenantData.isOpen : true,
            services
          });
        }
        if (results.length > 0) return results;
      } catch (err) {
        console.warn("Firestore fetch directory failed, falling back to database:", err);
      }
    }

    const businesses = await this.prisma.business.findMany({
      include: {
        services: true,
      },
    });

    return businesses.map((business) => {
      const resolvedSlug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { services = [], ...businessData } = business;
      return {
        ...businessData,
        id: business.id,
        name: business.name,
        slug: resolvedSlug,
        description: business.description || "",
        tagline: business.description || "",
        address: "",
        phone: "",
        openHours: "09:00 - 20:00",
        rating: 5.0,
        reviewCount: 0,
        isOpen: true,
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description || "",
          duration: s.duration,
          price: s.price,
          category: s.category || "General",
        })),
      };
    });
  }
}
