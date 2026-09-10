import { Controller, Post, Get, Patch, Body, Param, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { LocalesService } from "./locales.service";
import { CreateLocalDto } from "./dto/create-local.dto";
import { UpdateLocalDto } from "./dto/update-local.dto";
import { Request } from "express";
import { AuthUser } from "../auth/auth.types";

@ApiTags("Locales (Tenants)")
@ApiBearerAuth()
@Controller("locales")
export class LocalesController {
  constructor(private readonly localesService: LocalesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new Local (Tenant)" })
  create(@Req() req: Request, @Body() createLocalDto: CreateLocalDto) {
    const user = req.user as AuthUser;
    return this.localesService.create(user.uid, createLocalDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get Local profile" })
  getProfile(@Param("id") id: string) {
    return this.localesService.getProfile(id);
  }

  @Patch(":id")
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
