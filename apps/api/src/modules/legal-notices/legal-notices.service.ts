import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateLegalNoticeDto } from "./dto/create-legal-notice.dto";
import { UpdateLegalNoticeDto } from "./dto/update-legal-notice.dto";
import type { AuthUser } from "../auth/auth.types";

@Injectable()
export class LegalNoticesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLegalNoticeDto) {
    return this.prisma.legalNotice.create({
      data: {
        title: dto.title,
        content: dto.content,
        version: dto.version ?? "1.0",
        targetUserRole: dto.targetUserRole ?? null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(filter?: { role?: string; isActive?: boolean }) {
    const where: any = {};

    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    if (filter?.role) {
      where.OR = [
        { targetUserRole: null },
        { targetUserRole: "all" },
        { targetUserRole: filter.role },
      ];
    }

    return this.prisma.legalNotice.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const notice = await this.prisma.legalNotice.findUnique({
      where: { id },
    });
    if (!notice) {
      throw new NotFoundException(`Aviso legal con ID '${id}' no encontrado`);
    }
    return notice;
  }

  async update(id: string, dto: UpdateLegalNoticeDto) {
    await this.findById(id);
    return this.prisma.legalNotice.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.version !== undefined ? { version: dto.version } : {}),
        ...(dto.targetUserRole !== undefined ? { targetUserRole: dto.targetUserRole } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async getUnreadForUser(authUser: AuthUser) {
    const user = await this.findOrCreateUser(authUser);
    const userRole = user.role || authUser.role || "user";

    return this.prisma.legalNotice.findMany({
      where: {
        isActive: true,
        OR: [{ targetUserRole: null }, { targetUserRole: "all" }, { targetUserRole: userRole }],
        acceptances: {
          none: {
            userId: user.id,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async acceptNotice(noticeId: string, authUser: AuthUser) {
    if (!noticeId) {
      throw new BadRequestException("noticeId es requerido");
    }

    const notice = await this.findById(noticeId);
    const user = await this.findOrCreateUser(authUser);

    const acceptance = await this.prisma.legalNoticeAcceptance.upsert({
      where: {
        userId_legalNoticeId: {
          userId: user.id,
          legalNoticeId: notice.id,
        },
      },
      update: {
        acceptedAt: new Date(),
      },
      create: {
        userId: user.id,
        legalNoticeId: notice.id,
      },
    });

    return {
      success: true,
      message: "Aviso legal aceptado exitosamente",
      noticeId: notice.id,
      acceptedAt: acceptance.acceptedAt,
    };
  }

  async markAsRead(noticeId: string, authUser: AuthUser) {
    return this.acceptNotice(noticeId, authUser);
  }

  async findOrCreateUser(authUser: AuthUser) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: authUser.uid },
          { firebaseUid: authUser.uid },
          ...(authUser.email ? [{ email: authUser.email }] : []),
        ],
      },
    });

    if (!user) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        authUser.uid,
      );
      user = await this.prisma.user.create({
        data: {
          ...(isUuid ? { id: authUser.uid } : {}),
          firebaseUid: authUser.uid,
          email: authUser.email || `${authUser.uid}@turnero.local`,
          role: authUser.role || "user",
        },
      });
    } else if (!user.firebaseUid && authUser.uid) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: authUser.uid },
      });
    }

    return user;
  }
}
