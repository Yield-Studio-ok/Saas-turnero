import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CreateProductSaleDto } from "./dto/create-sale.dto";
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

  async registerSale(createSaleDto: CreateProductSaleDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: createSaleDto.productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Deduct stock if available
    if (product.stock >= (createSaleDto.quantity ?? 1)) {
      await this.prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: createSaleDto.quantity ?? 1 } },
      });
    }

    return this.prisma.productSale.create({
      data: {
        productId: createSaleDto.productId,
        businessId: createSaleDto.businessId,
        employeeId: createSaleDto.employeeId,
        quantity: createSaleDto.quantity ?? 1,
        unitPrice: createSaleDto.unitPrice,
        total: createSaleDto.total,
        paymentMethod: createSaleDto.paymentMethod,
        clientName: createSaleDto.clientName,
      },
      include: {
        product: true,
      },
    });
  }

  async getShiftSales(employeeId: string, businessId?: string) {
    const where: any = { employeeId };
    if (businessId) {
      where.businessId = businessId;
    }

    return this.prisma.productSale.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
      },
    });
  }
}
