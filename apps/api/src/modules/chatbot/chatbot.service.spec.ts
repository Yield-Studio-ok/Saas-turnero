import { ChatbotService } from "./chatbot.service";

describe("ChatbotService (Ticket 15)", () => {
  let service: ChatbotService;
  let mockPrisma: any;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    mockPrisma = {
      appointment: {
        count: jest.fn().mockResolvedValue(5),
      },
      employee: {
        findFirst: jest.fn().mockResolvedValue({ id: "emp-1", name: "Juan Perez" }),
      },
    };
    service = new ChatbotService(mockPrisma);
  });

  it("should answer turnos query in fallback mode", async () => {
    const res = await service.ask("¿cuántos turnos tengo hoy?");
    expect(res.reply).toContain("Hoy tienes 5 turnos programados en total.");
  });

  it("should answer cortes query for Juan in fallback mode", async () => {
    mockPrisma.appointment.count.mockResolvedValueOnce(3);
    const res = await service.ask("¿cuántos cortes hizo Juan?");
    expect(res.reply).toContain("Juan ha realizado 3 cortes hoy.");
  });

  it("should return default friendly message for unrecognized prompt in fallback mode", async () => {
    const res = await service.ask("Hola!");
    expect(res.reply).toContain("Hola, soy el Asistente de IA de tu dashboard.");
  });

  it("should respond cordially to informal greetings (que onda, papu, buenas)", async () => {
    const resQueOnda = await service.ask("que onda");
    expect(resQueOnda.reply).toContain("¡Qué onda!");
    expect(resQueOnda.reply).toContain("Hola, soy el Asistente de IA de tu dashboard.");

    const resPapu = await service.ask("hola papu todo bien?");
    expect(resPapu.reply).toContain("¡Buenas, crack!");
    expect(resPapu.reply).toContain("Hola, soy el Asistente de IA de tu dashboard.");

    const resBuenas = await service.ask("buenas tardes");
    expect(resBuenas.reply).toContain("¡Buenas!");
    expect(resBuenas.reply).toContain("Hola, soy el Asistente de IA de tu dashboard.");
  });

  it("should respond to common business questions (horarios, servicios, reseñas, equipo)", async () => {
    const resHorarios = await service.ask("¿cuáles son los horarios de atención?");
    expect(resHorarios.reply).toContain("horarios de atención");

    const resServicios = await service.ask("¿dónde configuro los precios y servicios?");
    expect(resServicios.reply).toContain("servicios");

    const resResenas = await service.ask("¿cómo funcionan las reseñas y puntos?");
    expect(resResenas.reply).toContain("calificaciones");

    const resEquipo = await service.ask("¿dónde veo a los empleados del equipo?");
    expect(resEquipo.reply).toContain("Empleados");
  });

  it("should instantiate and call Gemini when GEMINI_API_KEY is present", async () => {
    process.env.GEMINI_API_KEY = "dummy-api-key";
    const geminiService = new ChatbotService(mockPrisma);

    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => "Respuesta generada por Gemini AI",
      },
    });

    (geminiService as any).genAI = {
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    };

    const res = await geminiService.ask("¿Cómo optimizar mi agenda?");
    expect(res.reply).toBe("Respuesta generada por Gemini AI");
    expect(mockGenerateContent).toHaveBeenCalled();
  });
});
