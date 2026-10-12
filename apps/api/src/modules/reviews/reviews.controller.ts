import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Public } from "../auth/public.decorator";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Public()
  @Get("business/:businessId")
  findAllByBusiness(@Param("businessId") businessId: string) {
    return this.reviewsService.findAllByBusiness(businessId);
  }
}
