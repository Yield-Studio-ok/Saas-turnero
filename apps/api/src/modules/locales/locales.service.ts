import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FirebaseService } from "../auth/firebase.service";
import { CreateLocalDto } from "./dto/create-local.dto";
import { UpdateLocalDto } from "./dto/update-local.dto";

@Injectable()
export class LocalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  async create(ownerId: string, createLocalDto: CreateLocalDto) {
    const local = await this.prisma.local.create({
      data: {
        ...createLocalDto,
        ownerId,
      },
    });

    if (this.firebase.isEnabled()) {
      try {
        await this.firebase.setRole(ownerId, "owner", local.id);
      } catch (e) {
        console.error("Failed to set firebase role", e);
      }
    } else {
      await this.prisma.user.update({
        where: { id: ownerId },
        data: { role: "owner" },
      });
    }

    return local;
  }

  async getProfile(localId: string) {
    const local = await this.prisma.local.findUnique({
      where: { id: localId },
    });
    if (!local) throw new NotFoundException("Local not found");
    return local;
  }

  async updateProfile(localId: string, ownerId: string, updateLocalDto: UpdateLocalDto) {
    const local = await this.prisma.local.findUnique({
      where: { id: localId },
    });
    if (!local) throw new NotFoundException("Local not found");
    if (local.ownerId !== ownerId) throw new ForbiddenException("You do not own this local");

    return this.prisma.local.update({
      where: { id: localId },
      data: updateLocalDto,
    });
  }
}
