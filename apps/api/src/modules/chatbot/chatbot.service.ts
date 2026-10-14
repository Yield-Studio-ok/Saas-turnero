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

  async ask(message: string, businessId?: string): Promise<{ reply: string }> {
    const lowerMessage = (message || "").toLowerCase();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Gather dynamic business context
    let contextSummary = `Fecha de hoy: ${today}. `;
    try {
      const apptWhere: any = { date: today, status: "confirmed" };
      if (businessId) apptWhere.businessId = businessId;
      const turnosHoy = await this.prisma.appointment.count({ where: apptWhere });
      contextSummary += `Turnos confirmados para hoy: ${turnosHoy}. `;

      if (businessId) {
        const business = await this.prisma.business.findUnique({
          where: { id: businessId },
          include: {
            services: { select: { name: true, price: true, duration: true } },
            employees: { select: { name: true } },
          },
        });
        if (business) {
          contextSummary += `Negocio: ${business.name}. `;
          if (business.services.length > 0) {
            const servList = business.services
              .map((s) => `${s.name} ($${s.price}, ${s.duration}min)`)
              .join(", ");
            contextSummary += `Servicios disponibles: ${servList}. `;
          }
          if (business.employees.length > 0) {
            const empList = business.employees.map((e) => e.name).join(", ");
            contextSummary += `Equipo de trabajo: ${empList}. `;
          }
        }
      }
    } catch {
      // Continue without context if DB call fails
    }

    // 2. If Gemini is available, query Gemini API
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction:
            "Eres el asistente inteligente de Turnero para gestión de citas, servicios y negocios. Respondes de forma concisa, cordial y útil a los dueños de negocios, clientes y administradores sobre sus turnos, servicios y operaciones. Si el usuario pregunta por datos del negocio o de hoy, usa el contexto proporcionado con exactitud.",
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

    // 3. Fallback logic when Gemini is disabled or fails
    try {
      // Preguntas específicas sobre empleados (ej. Juan y cortes)
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

      // Preguntas sobre turnos o citas
      if (lowerMessage.includes("turnos") || lowerMessage.includes("citas")) {
        const turnosHoy = await this.prisma.appointment.count({
          where: { date: today, status: "confirmed" },
        });
        return { reply: `Hoy tienes ${turnosHoy} turnos programados en total.` };
      }

      // Preguntas habituales del negocio: Servicios y precios
      if (
        lowerMessage.includes("servicio") ||
        lowerMessage.includes("servicios") ||
        lowerMessage.includes("precio") ||
        lowerMessage.includes("precios") ||
        lowerMessage.includes("tarifa") ||
        lowerMessage.includes("tarifas")
      ) {
        try {
          const count = await this.prisma?.service?.count?.();
          if (typeof count === "number") {
            return {
              reply: `Tienes ${count} servicio(s) configurado(s). Puedes gestionar precios, nombres y duraciones desde el panel de Servicios.`,
            };
          }
        } catch {}
        return {
          reply:
            "Puedes gestionar y consultar tus servicios, precios y duraciones desde el menú de Servicios en el dashboard.",
        };
      }

      // Preguntas habituales del negocio: Horarios
      if (
        lowerMessage.includes("horario") ||
        lowerMessage.includes("horarios") ||
        lowerMessage.includes("atencion") ||
        lowerMessage.includes("atención") ||
        lowerMessage.includes("apertura") ||
        lowerMessage.includes("cierre")
      ) {
        return {
          reply:
            "Puedes consultar y configurar los horarios de atención de tu negocio y la disponibilidad de tus empleados en la sección de Horarios del dashboard.",
        };
      }

      // Preguntas habituales del negocio: Empleados / Equipo
      if (
        lowerMessage.includes("empleado") ||
        lowerMessage.includes("empleados") ||
        lowerMessage.includes("equipo") ||
        lowerMessage.includes("personal")
      ) {
        try {
          const count = await this.prisma?.employee?.count?.();
          if (typeof count === "number") {
            return {
              reply: `Actualmente cuentas con ${count} miembro(s) en tu equipo. Puedes gestionar sus perfiles y agendas en la sección de Empleados.`,
            };
          }
        } catch {}
        return {
          reply:
            "Puedes ver y coordinar a los profesionales de tu equipo desde la sección de Empleados del dashboard.",
        };
      }

      // Preguntas habituales del negocio: Reseñas / Fidelidad
      if (
        lowerMessage.includes("reseña") ||
        lowerMessage.includes("reseñas") ||
        lowerMessage.includes("calificaci") ||
        lowerMessage.includes("fidelidad") ||
        lowerMessage.includes("puntos")
      ) {
        return {
          reply:
            "Puedes consultar las calificaciones de tus clientes y gestionar el programa de puntos de fidelidad desde el módulo de Reseñas.",
        };
      }

      // Saludos informales cordiales
      if (lowerMessage.includes("papu")) {
        return {
          reply:
            "¡Buenas, crack! Hola, soy el Asistente de IA de tu dashboard. Puedo ayudarte con métricas, turnos y consultas de tus empleados. ¿Qué necesitas saber?",
        };
      }

      if (lowerMessage.includes("que onda") || lowerMessage.includes("qué onda")) {
        return {
          reply:
            "¡Qué onda! Hola, soy el Asistente de IA de tu dashboard. Puedo ayudarte con el estado de tus turnos, empleados y métricas del negocio. ¿Qué necesitas saber?",
        };
      }

      if (
        lowerMessage.includes("buenas") ||
        lowerMessage.includes("buen dia") ||
        lowerMessage.includes("buen día") ||
        lowerMessage.includes("buenos dias") ||
        lowerMessage.includes("buenos días")
      ) {
        return {
          reply:
            "¡Buenas! Hola, soy el Asistente de IA de tu dashboard. Puedo ayudarte con métricas, turnos y consultas de tus empleados. ¿Qué necesitas saber?",
        };
      }

      if (lowerMessage.includes("hola")) {
        return {
          reply:
            "Hola, soy el Asistente de IA de tu dashboard. Puedo ayudarte con métricas y consultas de tus empleados. ¿Qué necesitas saber?",
        };
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
