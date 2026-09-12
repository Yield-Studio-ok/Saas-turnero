import { Controller, Post, Body } from "@nestjs/common";
import { ChatbotService } from "./chatbot.service";

@Controller("chatbot")
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post("ask")
  async ask(@Body("message") message: string) {
    return this.chatbotService.ask(message);
  }
}
