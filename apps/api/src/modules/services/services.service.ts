import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkLocalOwnership(userId: string, localId: string) {
    const local = await this.prisma.local.findUnique({ where: { id: localId } });
    if (!local) throw new NotFoundException("Local not found");
    if (local.ownerId !== userId) {
      throw new ForbiddenException("You do not have permission to manage this Local");
    }
  }

  async create(userId: string, createServiceDto: CreateServiceDto) {
    await this.checkLocalOwnership(userId, createServiceDto.localId);
    return this.prisma.service.create({ data: createServiceDto });
  }

  async findAllByLocal(userId: string, localId: string) {
    await this.checkLocalOwnership(userId, localId);
    return this.prisma.service.findMany({ where: { localId } });
  }

  async findOne(userId: string, id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Service not found");
    await this.checkLocalOwnership(userId, service.localId);
    return service;
  }

  async update(userId: string, id: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.findOne(userId, id); // validates ownership
    if (updateServiceDto.localId && updateServiceDto.localId !== service.localId) {
      await this.checkLocalOwnership(userId, updateServiceDto.localId);
    }
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // validates ownership
    return this.prisma.service.delete({ where: { id } });
  }
}
