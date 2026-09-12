import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Request } from "express";
import { AuthUser } from "../auth/auth.types";
import { Public } from "../auth/public.decorator";

@ApiTags("Products (Items, Stock, etc)")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a product" })
  create(@Req() req: Request, @Body() createProductDto: CreateProductDto) {
    const user = req.user as AuthUser;
    return this.productsService.create(user.uid, createProductDto);
  }

  @Public()
  @Get("public")
  @ApiOperation({ summary: "Get public products of a business" })
  @ApiQuery({ name: "businessId", required: true, type: String })
  findPublic(@Query("businessId") businessId: string) {
    return this.productsService.findPublicByBusiness(businessId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all products of a business" })
  @ApiQuery({ name: "businessId", required: true, type: String })
  findAll(@Req() req: Request, @Query("businessId") businessId: string) {
    const user = req.user as AuthUser;
    return this.productsService.findAllByBusiness(user.uid, businessId);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a product by ID" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as AuthUser;
    return this.productsService.findOne(user.uid, id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a product" })
  update(@Req() req: Request, @Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    const user = req.user as AuthUser;
    return this.productsService.update(user.uid, id, updateProductDto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a product" })
  remove(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as AuthUser;
    return this.productsService.remove(user.uid, id);
  }
}

