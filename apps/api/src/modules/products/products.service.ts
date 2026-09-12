import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkBusinessOwnership(userId: string, businessId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException("Business not found");
    if (business.ownerId !== userId) {
      throw new ForbiddenException("You do not have permission to manage this Business");
    }
  }

  async create(userId: string, createProductDto: CreateProductDto) {
    await this.checkBusinessOwnership(userId, createProductDto.businessId);
    return this.prisma.product.create({ data: createProductDto });
  }

  async findAllByBusiness(userId: string, businessId: string) {
    await this.checkBusinessOwnership(userId, businessId);
    return this.prisma.product.findMany({ where: { businessId } });
  }

  async findPublicByBusiness(businessId: string) {
    return this.prisma.product.findMany({ where: { businessId } });
  }

  async findOne(userId: string, id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    await this.checkBusinessOwnership(userId, product.businessId);
    return product;
  }

  async update(userId: string, id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(userId, id);
    if (updateProductDto.businessId && updateProductDto.businessId !== product.businessId) {
      await this.checkBusinessOwnership(userId, updateProductDto.businessId);
    }
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.product.delete({ where: { id } });
  }
}

