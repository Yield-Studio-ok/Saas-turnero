import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCustomerRatingDto {
  @ApiProperty({ description: "Business ID" })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiPropertyOptional({ description: "Employee ID who rates" })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({ description: "Customer name" })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiPropertyOptional({ description: "Customer email" })
  @IsString()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional({ description: "Customer phone" })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ description: "Rating from 1 to 5", minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: "Optional feedback comment" })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({ description: "Punctuality flag: a_tiempo, tarde, no_asistio" })
  @IsString()
  @IsOptional()
  punctuality?: string;

  @ApiPropertyOptional({ description: "Appointment ID associated with this rating" })
  @IsString()
  @IsOptional()
  appointmentId?: string;
}
