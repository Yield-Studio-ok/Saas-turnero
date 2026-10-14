import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AskChatbotDto {
  @ApiProperty({ description: "Question or message for the chatbot" })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: "Optional business ID for contextual answering" })
  @IsString()
  @IsOptional()
  businessId?: string;
}
