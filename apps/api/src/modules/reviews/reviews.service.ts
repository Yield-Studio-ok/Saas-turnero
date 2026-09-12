import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";

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
}
