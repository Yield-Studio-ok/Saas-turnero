import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateLocalDto {
  @ApiProperty({ description: "The name of the local" })
  @IsString()
  name: string;

  @ApiProperty({ description: "The description of the local", required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
