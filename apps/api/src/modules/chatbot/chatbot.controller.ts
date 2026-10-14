import { Controller, Post, Body } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";
import { AskChatbotDto } from "./dto/ask-chatbot.dto";
import { Public } from "../auth/public.decorator";

@Controller("chatbot")
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Post("ask")
  async ask(@Body() dto: AskChatbotDto) {
    return this.chatbotService.ask(dto.message, dto.businessId);
  }
}
