import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { Request } from "express";
import { LegalNoticesService } from "./legal-notices.service";
import { CreateLegalNoticeDto } from "./dto/create-legal-notice.dto";
import { UpdateLegalNoticeDto } from "./dto/update-legal-notice.dto";
import { Public } from "../auth/public.decorator";
import type { AuthUser } from "../auth/auth.types";

@ApiTags("Legal Notices")
@Controller("legal-notices")
export class LegalNoticesController {
  constructor(private readonly legalNoticesService: LegalNoticesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Crear un nuevo aviso legal" })
  create(@Body() createNoticeDto: CreateLegalNoticeDto) {
    return this.legalNoticesService.create(createNoticeDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Listar avisos legales" })
  @ApiQuery({
    name: "role",
    required: false,
    description: "Filtrar por rol de usuario ('owner', 'user', etc.)",
  })
  @ApiQuery({
    name: "active",
    required: false,
    description: "Filtrar por estado activo ('true' o 'false')",
  })
  findAll(@Query("role") role?: string, @Query("active") active?: string) {
    const isActive = active !== undefined ? active === "true" : undefined;
    return this.legalNoticesService.findAll({ role, isActive });
  }

  @Get("unread")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtener avisos legales no leídos por el usuario actual" })
  getUnread(@Req() req: Request) {
    const user = req.user as AuthUser;
    if (!user) {
      throw new UnauthorizedException("Usuario no autenticado");
    }
    return this.legalNoticesService.getUnreadForUser(user);
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Obtener un aviso legal por ID" })
  @ApiParam({ name: "id", description: "ID del aviso legal" })
  findOne(@Param("id") id: string) {
    return this.legalNoticesService.findById(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Actualizar un aviso legal" })
  @ApiParam({ name: "id", description: "ID del aviso legal" })
  update(@Param("id") id: string, @Body() updateNoticeDto: UpdateLegalNoticeDto) {
    return this.legalNoticesService.update(id, updateNoticeDto);
  }

  @Post(":id/accept")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Aceptar un aviso legal" })
  @ApiParam({ name: "id", description: "ID del aviso legal" })
  accept(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as AuthUser;
    if (!user) {
      throw new UnauthorizedException("Usuario no autenticado");
    }
    return this.legalNoticesService.acceptNotice(id, user);
  }

  @Post(":id/read")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Marcar como leído un aviso legal (alias de accept)" })
  @ApiParam({ name: "id", description: "ID del aviso legal" })
  markAsRead(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as AuthUser;
    if (!user) {
      throw new UnauthorizedException("Usuario no autenticado");
    }
    return this.legalNoticesService.markAsRead(id, user);
  }
}
