import { IsString, IsInt, Min, Max, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateScheduleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @ApiProperty({ description: "0 = Sunday, 1 = Monday..." })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: "09:00" })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: "18:00" })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}
