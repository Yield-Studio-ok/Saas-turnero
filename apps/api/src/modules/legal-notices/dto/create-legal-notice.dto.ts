import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateLegalNoticeDto {
  @ApiProperty({ example: "Términos y Condiciones del Servicio" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "Al utilizar esta plataforma, usted acepta los siguientes términos..." })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: "1.0", default: "1.0" })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiPropertyOptional({
    example: "owner",
    description: "Rol objetivo: 'owner', 'user', 'admin', o omitir / 'all' para todos",
  })
  @IsString()
  @IsOptional()
  targetUserRole?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
