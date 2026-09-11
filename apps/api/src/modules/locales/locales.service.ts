import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FirebaseService } from "../auth/firebase.service";
import { CreateLocalDto } from "./dto/create-local.dto";
import { UpdateLocalDto } from "./dto/update-local.dto";

@Injectable()
export class LocalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  async create(ownerId: string, createLocalDto: CreateLocalDto) {
    const local = await this.prisma.local.create({
      data: {
        ...createLocalDto,
        ownerId,
      },
    });

    if (this.firebase.isEnabled()) {
      try {
        await this.firebase.setRole(ownerId, "owner", local.id);
        const db = this.firebase.getFirestore();
        await db.collection("tenants").doc(local.id).set(
          {
            id: local.id,
            name: local.name,
            description: local.description,
            ownerId: local.ownerId,
            createdAt: local.createdAt.toISOString(),
            updatedAt: local.updatedAt.toISOString(),
          },
          { merge: true },
        );
      } catch (e) {
        console.error("Failed to set firebase role or sync tenant", e);
      }
    } else {
      await this.prisma.user.update({
        where: { id: ownerId },
        data: { role: "owner" },
      });
    }

    return local;
  }

  async getProfile(localId: string) {
    const local = await this.prisma.local.findUnique({
      where: { id: localId },
    });
    if (!local) throw new NotFoundException("Local not found");
    return local;
  }

  async updateProfile(localId: string, ownerId: string, updateLocalDto: UpdateLocalDto) {
    const local = await this.prisma.local.findUnique({
      where: { id: localId },
    });
    if (!local) throw new NotFoundException("Local not found");
    if (local.ownerId !== ownerId) throw new ForbiddenException("You do not own this local");

    const updated = await this.prisma.local.update({
      where: { id: localId },
      data: updateLocalDto,
    });

    if (this.firebase.isEnabled()) {
      try {
        const db = this.firebase.getFirestore();
        await db
          .collection("tenants")
          .doc(localId)
          .set(
            {
              ...updateLocalDto,
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
              .where("localId", "==", tenantId)
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
                where: { localId: tenantId },
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
            local: {
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
    const local = await this.prisma.local.findFirst({
      where: {
        OR: [{ id: trimmedIdentifier }, { name: trimmedIdentifier }],
      },
      include: {
        services: true,
      },
    });

    if (!local) {
      throw new NotFoundException(`Tenant or Local '${trimmedIdentifier}' not found`);
    }

    const { services = [], ...localData } = local;
    const resolvedSlug = local.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return {
      ...localData,
      id: local.id,
      name: local.name,
      slug: resolvedSlug,
      description: local.description || "",
      tagline: local.description || "",
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
      local: {
        ...localData,
        id: local.id,
        name: local.name,
        slug: resolvedSlug,
        description: local.description || "",
        tagline: local.description || "",
        address: "",
        phone: "",
        openHours: "09:00 - 20:00",
        rating: 5.0,
        reviewCount: 0,
        isOpen: true,
      },
      tenant: {
        ...localData,
        id: local.id,
        name: local.name,
        slug: resolvedSlug,
      },
    };
  }

  async getPublicServices(identifier: string) {
    const profile = await this.getPublicProfile(identifier);
    return profile.services;
  }
}
