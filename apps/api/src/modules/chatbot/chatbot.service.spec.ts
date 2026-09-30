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
