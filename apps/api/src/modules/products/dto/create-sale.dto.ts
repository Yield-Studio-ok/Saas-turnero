import { IsString, IsOptional, IsNumber, IsNotEmpty, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateProductSaleDto {
  @ApiProperty({ description: "ID of the product sold" })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: "ID of the business where sale occurred" })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ description: "ID of the employee registering the sale" })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiPropertyOptional({ default: 1, description: "Quantity of items sold" })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: "Unit price at the time of sale" })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: "Total amount of the sale" })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ description: "Payment method: cash, card, transfer", example: "cash" })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiPropertyOptional({ description: "Optional name of the customer" })
  @IsString()
  @IsOptional()
  clientName?: string;
}
