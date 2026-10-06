import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAppointmentDto {
  @ApiPropertyOptional({ description: "Business ID" })
  @IsString()
  @IsOptional()
  businessId?: string;

  @ApiPropertyOptional({ description: "Legacy local identifier (mapped to businessId)" })
  @IsString()
  @IsOptional()
  localId?: string;

  @ApiPropertyOptional({ description: "Assigned employee ID" })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiProperty({ description: "Service ID to book" })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: "Date of appointment (YYYY-MM-DD)" })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: "Start time (HH:mm)" })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: "End time (HH:mm)" })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ description: "Customer name" })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ description: "Customer email" })
  @IsString()
  @IsNotEmpty()
  customerEmail: string;

  @ApiPropertyOptional({ description: "Customer phone number" })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ description: "Notes or comments" })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: "Status of the appointment", default: "confirmed" })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: "Duration in minutes" })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({ description: "Price of the service" })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ description: "Service name (optional/informational)" })
  @IsString()
  @IsOptional()
  serviceName?: string;

  @ApiPropertyOptional({ description: "Employee name (optional/informational)" })
  @IsString()
  @IsOptional()
  employeeName?: string;
}
