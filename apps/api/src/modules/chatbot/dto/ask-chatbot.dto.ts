import { IsNotEmpty, IsString } from "class-validator";

export class AskChatbotDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
