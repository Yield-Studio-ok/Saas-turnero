import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ChatbotService {
  constructor(private prisma: PrismaService) {}

  async ask(message: string): Promise<{ reply: string }> {
    const lowerMessage = message.toLowerCase();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

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
            reply: "Según mis datos en la base, Juan ha realizado " + cortesHoy + " cortes hoy.",
          };
        } else {
          return { reply: "No encontré a ningún empleado llamado Juan en la base de datos." };
        }
      }

      if (lowerMessage.includes("turnos") || lowerMessage.includes("citas")) {
        const turnosHoy = await this.prisma.appointment.count({
          where: { date: today, status: "confirmed" },
        });
        return { reply: "Hoy tienes " + turnosHoy + " turnos programados en total." };
      }
    } catch (err) {
      console.error("Error in chatbot:", err);
    }

    return {
      reply:
        "Hola, soy el Asistente de IA de tu dashboard. Puedo ayudarte con métricas y consultas de tus empleados. ¿Qué necesitas saber?",
    };
  }
}
