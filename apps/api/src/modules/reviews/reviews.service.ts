import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CreateCustomerRatingDto } from "./dto/create-customer-rating.dto";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto) {
    const review = await this.prisma.review.create({
      data: createReviewDto,
    });

    // Add loyalty points if userId is provided
    if (createReviewDto.userId) {
      await this.prisma.user.update({
        where: { id: createReviewDto.userId },
        data: {
          loyaltyPoints: {
            increment: 10, // Assigning 10 points per review
          },
        },
      });
    }

    return review;
  }

  async findAllByBusiness(businessId: string) {
    return this.prisma.review.findMany({
      where: { businessId },
      include: {
        user: {
          select: { name: true, email: true },
        },
        appointment: {
          select: { service: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createCustomerRating(dto: CreateCustomerRatingDto) {
    return this.prisma.customerRating.create({
      data: {
        businessId: dto.businessId,
        employeeId: dto.employeeId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        rating: dto.rating,
        comment: dto.comment,
        punctuality: dto.punctuality || "a_tiempo",
        appointmentId: dto.appointmentId,
      },
    });
  }

  async getCustomerReputation(customerEmail?: string, customerPhone?: string, businessId?: string) {
    const conditions: any[] = [];
    if (customerEmail) conditions.push({ customerEmail });
    if (customerPhone) conditions.push({ customerPhone });

    if (conditions.length === 0) {
      return {
        averageRating: 5.0,
        totalRatings: 0,
        punctualityStats: { a_tiempo: 0, tarde: 0, no_asistio: 0 },
        ratings: [],
      };
    }

    const where: any = { OR: conditions };
    if (businessId) where.businessId = businessId;

    const ratings = await this.prisma.customerRating.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (ratings.length === 0) {
      return {
        averageRating: 5.0,
        totalRatings: 0,
        punctualityStats: { a_tiempo: 0, tarde: 0, no_asistio: 0 },
        ratings: [],
      };
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = Number((sum / ratings.length).toFixed(1));

    const punctualityStats = {
      a_tiempo: ratings.filter((r) => r.punctuality === "a_tiempo").length,
      tarde: ratings.filter((r) => r.punctuality === "tarde").length,
      no_asistio: ratings.filter((r) => r.punctuality === "no_asistio").length,
    };

    return {
      averageRating,
      totalRatings: ratings.length,
      punctualityStats,
      ratings,
    };
  }
}
