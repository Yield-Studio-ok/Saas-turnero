import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkBusinessOwnership(userId: string, businessId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException("Business not found");
    if (business.ownerId !== userId) {
      throw new ForbiddenException("You do not have permission to manage this Business");
    }
  }

  async create(userId: string, createServiceDto: CreateServiceDto) {
    await this.checkBusinessOwnership(userId, createServiceDto.businessId);
    return this.prisma.service.create({ data: createServiceDto });
  }

  async findAllByBusiness(userId: string, businessId: string) {
    await this.checkBusinessOwnership(userId, businessId);
    return this.prisma.service.findMany({ where: { businessId } });
  }

  async findPublicByBusiness(businessId: string) {
    return this.prisma.service.findMany({ where: { businessId } });
  }

  async findOne(userId: string, id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Service not found");
    await this.checkBusinessOwnership(userId, service.businessId);
    return service;
  }

  async update(userId: string, id: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.findOne(userId, id); // validates ownership
    if (updateServiceDto.businessId && updateServiceDto.businessId !== service.businessId) {
      await this.checkBusinessOwnership(userId, updateServiceDto.businessId);
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
