import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Request } from "express";
import { AuthUser } from "../auth/auth.types";

@ApiTags("Services (Haircuts, etc)")
@ApiBearerAuth()
@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: "Create a service" })
  create(@Req() req: Request, @Body() createServiceDto: CreateServiceDto) {
    const user = req.user as AuthUser;
    return this.servicesService.create(user.uid, createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all services of a local" })
  @ApiQuery({ name: "localId", required: true, type: String })
  findAll(@Req() req: Request, @Query("localId") localId: string) {
    const user = req.user as AuthUser;
    return this.servicesService.findAllByLocal(user.uid, localId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a service by ID" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as AuthUser;
    return this.servicesService.findOne(user.uid, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a service" })
  update(@Req() req: Request, @Param("id") id: string, @Body() updateServiceDto: UpdateServiceDto) {
    const user = req.user as AuthUser;
    return this.servicesService.update(user.uid, id, updateServiceDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a service" })
  remove(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as AuthUser;
    return this.servicesService.remove(user.uid, id);
  }
}
