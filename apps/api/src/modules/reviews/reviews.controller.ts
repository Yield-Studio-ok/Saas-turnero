import { Controller, Post, Body, Get, Param, Query } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CreateCustomerRatingDto } from "./dto/create-customer-rating.dto";
import { Public } from "../auth/public.decorator";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";

@ApiTags("Reviews")
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

  @Public()
  @Post("customer")
  @ApiOperation({ summary: "Rate customer by employee/business" })
  createCustomerRating(@Body() dto: CreateCustomerRatingDto) {
    return this.reviewsService.createCustomerRating(dto);
  }

  @Public()
  @Get("customer")
  @ApiOperation({ summary: "Get customer reputation and rating statistics" })
  @ApiQuery({ name: "email", required: false, type: String })
  @ApiQuery({ name: "phone", required: false, type: String })
  @ApiQuery({ name: "businessId", required: false, type: String })
  getCustomerReputation(
    @Query("email") email?: string,
    @Query("phone") phone?: string,
    @Query("businessId") businessId?: string,
  ) {
    return this.reviewsService.getCustomerReputation(email, phone, businessId);
  }
}
