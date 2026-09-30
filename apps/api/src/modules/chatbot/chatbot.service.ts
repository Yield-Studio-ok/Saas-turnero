import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn(
        "GEMINI_API_KEY is not defined. Chatbot will use fallback rule-based responses.",
      );
    }
  }

  async ask(message: string): Promise<{ reply: string }> {
    const lowerMessage = (message || "").toLowerCase();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. If Gemini is available, query Gemini API
    if (this.genAI) {
      let contextSummary = "";
      try {
        const turnosHoy = await this.prisma.appointment.count({
          where: { date: today, status: "confirmed" },
        });
        contextSummary = `Fecha de hoy: ${today}. Total de turnos confirmados para hoy: ${turnosHoy}.`;
      } catch {
        // Continue without context if DB call fails
      }

      try {
        const model = this.genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction:
            "Eres el asistente inteligente de Turnero para gestión de citas, servicios y negocios. Respondes de forma concisa, cordial y útil a los dueños de negocios y administradores sobre sus turnos, clientes y operaciones. Si el usuario pregunta por datos de hoy, usa el contexto proporcionado.",
        });

        const prompt = `${contextSummary ? `[Contexto actual del negocio: ${contextSummary}]\n` : ""}Pregunta del usuario: ${message}`;
        const result = await model.generateContent(prompt);
        const reply = result.response.text();
        if (reply && reply.trim().length > 0) {
          return { reply: reply.trim() };
        }
      } catch (geminiError) {
        this.logger.error(
          "Error querying Gemini API, falling back to rule-based logic",
          geminiError,
        );
      }
    }

    // 2. Fallback logic when Gemini is disabled or fails
    try {
      if (lowerMessage.includes("cortes") && lowerMessage.includes("juan")) {
        const juan = await this.prisma.employee.findFirst({
          where: { name: { contains: "juan", mode: "insensitive" } },
        });

        if (juan) {
          const cortesHoy = await this.prisma.appointment.count({
            where: {
              employeeId: juan.id,
              date: today,
              status: "confirmed",
            },
          });
          return {
            reply: `Según mis datos en la base, Juan ha realizado ${cortesHoy} cortes hoy.`,
          };
        } else {
          return { reply: "No encontré a ningún empleado llamado Juan en la base de datos." };
        }
      }

      if (lowerMessage.includes("turnos") || lowerMessage.includes("citas")) {
        const turnosHoy = await this.prisma.appointment.count({
          where: { date: today, status: "confirmed" },
        });
        return { reply: `Hoy tienes ${turnosHoy} turnos programados en total.` };
      }
    } catch (err) {
      this.logger.error("Error in chatbot fallback logic", err);
    }

    return {
      reply:
        "Hola, soy el Asistente de IA de tu dashboard. Puedo ayudarte con métricas y consultas de tus empleados. ¿Qué necesitas saber?",
    };
  }
}
