import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscriptionPlan } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { CreateAdminBusinessDto } from "./dto/create-admin-business.dto";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllBusinesses(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.business.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.business.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBusinessPlan(id: string, plan: SubscriptionPlan) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    return this.prisma.business.update({
      where: { id },
      data: { plan },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async createBusiness(dto: CreateAdminBusinessDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.ownerEmail },
    });

    if (!user) {
      const hashedPassword = dto.ownerPassword
        ? await bcrypt.hash(dto.ownerPassword, 10)
        : await bcrypt.hash("TempPass123!", 10);

      user = await this.prisma.user.create({
        data: {
          email: dto.ownerEmail,
          name: dto.ownerName || dto.ownerEmail.split("@")[0],
          password: hashedPassword,
          role: "owner",
        },
      });
    } else {
      if (user.role !== "owner" && user.role !== "superadmin") {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { role: "owner" },
        });
      }
    }

    return this.prisma.business.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        ownerId: user.id,
        plan: dto.plan || SubscriptionPlan.BASIC,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async getMetrics() {
    const [totalBusinesses, totalAppointments, appointments] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.appointment.count(),
      this.prisma.appointment.findMany({
        select: {
          paidAmount: true,
          service: {
            select: { price: true },
          },
        },
      }),
    ]);

    const totalRevenue = appointments.reduce((sum, app) => {
      return sum + (app.paidAmount ?? app.service?.price ?? 0);
    }, 0);

    return {
      totalBusinesses,
      totalAppointments,
      totalRevenue,
    };
  }
}
