import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { BusinessesService } from "./businesses.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";
import { Request } from "express";
import { AuthUser } from "../auth/auth.types";
import { Public } from "../auth/public.decorator";

@ApiTags("Businesses (Tenants)")
@Controller(["business", "businesses", "tenants"])
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new Business (Tenant)" })
  create(@Req() req: Request, @Body() createBusinessDto: CreateBusinessDto) {
    const user = req.user as AuthUser;
    return this.businessesService.create(user.uid, user.email, createBusinessDto);
  }

  @Public()
  @Get("public/:identifier")
  @ApiOperation({ summary: "Get public tenant profile and services by ID or slug" })
  @ApiParam({ name: "identifier", description: "Tenant ID or slug (e.g. barberia-vintage)" })
  getPublicProfile(@Param("identifier") identifier: string) {
    return this.businessesService.getPublicProfile(identifier);
  }

  @Public()
  @Get("public")
  @ApiOperation({ summary: "Get public tenant profile and services by query params" })
  @ApiQuery({ name: "slug", required: false, type: String })
  @ApiQuery({ name: "id", required: false, type: String })
  @ApiQuery({ name: "businessId", required: false, type: String })
  getPublicProfileQuery(
    @Query("slug") slug?: string,
    @Query("id") id?: string,
    @Query("businessId") businessId?: string,
  ) {
    const identifier = slug || id || businessId;
    if (!identifier) {
      throw new BadRequestException("slug, id or businessId query parameter is required");
    }
    return this.businessesService.getPublicProfile(identifier);
  }

  @Public()
  @Get(":id/public")
  @ApiOperation({ summary: "Get public tenant profile and services by ID" })
  @ApiParam({ name: "id", description: "Tenant ID" })
  getPublicProfileById(@Param("id") id: string) {
    return this.businessesService.getPublicProfile(id);
  }

  @Public()
  @Get(":id/services/public")
  @ApiOperation({ summary: "Get public services of a tenant by ID" })
  @ApiParam({ name: "id", description: "Tenant ID" })
  getPublicServices(@Param("id") id: string) {
    return this.businessesService.getPublicServices(id);
  }

  @Public()
  @Get(":id/services")
  @ApiOperation({ summary: "Get public services of a tenant by ID (alias)" })
  @ApiParam({ name: "id", description: "Tenant ID" })
  getPublicServicesAlias(@Param("id") id: string) {
    return this.businessesService.getPublicServices(id);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get Business profile" })
  getProfile(@Param("id") id: string) {
    return this.businessesService.getProfile(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update Business profile" })
  updateProfile(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    const user = req.user as AuthUser;
    return this.businessesService.updateProfile(id, user.uid, updateBusinessDto);
  }
}

