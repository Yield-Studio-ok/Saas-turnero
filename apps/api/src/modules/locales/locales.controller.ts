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
import { LocalesService } from "./locales.service";
import { CreateLocalDto } from "./dto/create-local.dto";
import { UpdateLocalDto } from "./dto/update-local.dto";
import { Request } from "express";
import { AuthUser } from "../auth/auth.types";
import { Public } from "../auth/public.decorator";

@ApiTags("Locales (Tenants)")
@Controller(["locales", "tenants"])
export class LocalesController {
  constructor(private readonly localesService: LocalesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new Local (Tenant)" })
  create(@Req() req: Request, @Body() createLocalDto: CreateLocalDto) {
    const user = req.user as AuthUser;
    return this.localesService.create(user.uid, createLocalDto);
  }

  @Public()
  @Get("public/:identifier")
  @ApiOperation({ summary: "Get public tenant profile and services by ID or slug" })
  @ApiParam({ name: "identifier", description: "Tenant ID or slug (e.g. barberia-vintage)" })
  getPublicProfile(@Param("identifier") identifier: string) {
    return this.localesService.getPublicProfile(identifier);
  }

  @Public()
  @Get("public")
  @ApiOperation({ summary: "Get public tenant profile and services by query params" })
  @ApiQuery({ name: "slug", required: false, type: String })
  @ApiQuery({ name: "id", required: false, type: String })
  @ApiQuery({ name: "localId", required: false, type: String })
  getPublicProfileQuery(
    @Query("slug") slug?: string,
    @Query("id") id?: string,
    @Query("localId") localId?: string,
  ) {
    const identifier = slug || id || localId;
    if (!identifier) {
      throw new BadRequestException("slug, id or localId query parameter is required");
    }
    return this.localesService.getPublicProfile(identifier);
  }

  @Public()
  @Get(":id/public")
  @ApiOperation({ summary: "Get public tenant profile and services by ID" })
  @ApiParam({ name: "id", description: "Tenant ID" })
  getPublicProfileById(@Param("id") id: string) {
    return this.localesService.getPublicProfile(id);
  }

  @Public()
  @Get(":id/services/public")
  @ApiOperation({ summary: "Get public services of a tenant by ID" })
  @ApiParam({ name: "id", description: "Tenant ID" })
  getPublicServices(@Param("id") id: string) {
    return this.localesService.getPublicServices(id);
  }

  @Public()
  @Get(":id/services")
  @ApiOperation({ summary: "Get public services of a tenant by ID (alias)" })
  @ApiParam({ name: "id", description: "Tenant ID" })
  getPublicServicesAlias(@Param("id") id: string) {
    return this.localesService.getPublicServices(id);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get Local profile" })
  getProfile(@Param("id") id: string) {
    return this.localesService.getProfile(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update Local profile" })
  updateProfile(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() updateLocalDto: UpdateLocalDto,
  ) {
    const user = req.user as AuthUser;
    return this.localesService.updateProfile(id, user.uid, updateLocalDto);
  }
}
