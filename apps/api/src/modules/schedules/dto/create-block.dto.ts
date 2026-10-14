import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBlockDto {
  @ApiProperty({ description: "Business ID" })
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ description: "Employee ID" })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ description: "Date formatted as YYYY-MM-DD" })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: "Start time formatted as HH:mm" })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: "End time formatted as HH:mm" })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({ description: "Reason for the schedule block" })
  @IsString()
  @IsOptional()
  reason?: string;
}
