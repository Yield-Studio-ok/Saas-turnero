import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBusinessDto {
  @ApiProperty({ description: "The name of the business" })
  @IsString()
  name: string;

  @ApiProperty({ description: "The description of the business", required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
