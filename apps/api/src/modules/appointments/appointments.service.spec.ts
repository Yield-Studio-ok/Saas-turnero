import { NotFoundException } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsController } from "./appointments.controller";

describe("Appointments Cancellation (Ticket 21)", () => {
  let service: AppointmentsService;
  let controller: AppointmentsController;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      appointment: {
        findUnique: jest.fn().mockResolvedValue({
          id: "appointment-123",
          businessId: "local-1",
          employeeId: "emp-1",
          serviceId: "srv-1",
          date: "2026-09-15",
          startTime: "10:00",
          endTime: "11:00",
          status: "confirmed",
          customerEmail: "cliente@test.com",
          service: { id: "srv-1", price: 1500 },
        }),
        update: jest.fn().mockImplementation(({ where, data }) => ({
          id: where.id,
          ...data,
        })),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation(({ data }) => ({
          id: "appt-new-1",
          ...data,
        })),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockPrisma);
      }),
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: "user-1", email: "cliente@test.com", credits: 0 }),
        update: jest.fn().mockResolvedValue({ id: "user-1", credits: 1500 }),
      },
      service: {
        findUnique: jest.fn().mockResolvedValue({
          id: "srv-1",
          name: "Corte de Pelo",
          price: 2500,
          duration: 30,
          businessId: "biz-1",
        }),
      },
      employee: {
        findUnique: jest.fn().mockResolvedValue({
          id: "emp-1",
          name: "Lucas Barber",
          businessId: "biz-1",
        }),
        findFirst: jest.fn().mockResolvedValue({
          id: "emp-1",
          name: "Lucas Barber",
          businessId: "biz-1",
        }),
      },
      schedule: {
        findMany: jest.fn().mockResolvedValue([{ startTime: "09:00", endTime: "20:00" }]),
      },
      business: {
        findFirst: jest.fn().mockResolvedValue({
          id: "biz-1",
          name: "Barberia Central",
        }),
      },
    };

    service = new AppointmentsService(mockPrisma as any);
    controller = new AppointmentsController(service);
  });

  describe("AppointmentsService.cancelAppointment", () => {
    it("should update appointment status to cancelled", async () => {
      const result = await service.cancelAppointment("appointment-123");

      expect(mockPrisma.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: "appointment-123" },
        include: { service: true },
      });
      expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
        where: { id: "appointment-123" },
        data: {
          status: "cancelled",
          cancellationReason: undefined,
        },
      });
      expect(result.status).toBe("cancelled");
      expect(result.id).toBe("appointment-123");
    });

    it("should store cancellationReason if provided", async () => {
      const result = await service.cancelAppointment("appointment-123", "Cliente reprogramo");

      expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
        where: { id: "appointment-123" },
        data: {
          status: "cancelled",
          cancellationReason: "Cliente reprogramo",
        },
      });
      expect(result.cancellationReason).toBe("Cliente reprogramo");
    });

    it("should throw NotFoundException when appointment does not exist", async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.cancelAppointment("non-existent-id")).rejects.toThrow(NotFoundException);
    });

    it("should support cancel alias", async () => {
      const result = await service.cancel("appointment-123");
      expect(result.status).toBe("cancelled");
    });
  });

  describe("AppointmentsController routes", () => {
    it("cancelAppointment PATCH should delegate to service", async () => {
      const result = await controller.cancelAppointment("appointment-123", { reason: "test" });
      expect(result.status).toBe("cancelled");
    });

    it("cancelAppointmentPost POST should delegate to service", async () => {
      const result = await controller.cancelAppointmentPost("appointment-123");
      expect(result.status).toBe("cancelled");
    });

    it("cancelAppointmentDelete DELETE should delegate to service", async () => {
      const result = await controller.cancelAppointmentDelete("appointment-123");
      expect(result.status).toBe("cancelled");
    });

    it("updateOrCancel PATCH should delegate to service", async () => {
      const result = await controller.updateOrCancel("appointment-123");
      expect(result.status).toBe("cancelled");
    });
  });

  describe("AppointmentsService.createAppointment (Ticket 22)", () => {
    it("should create an appointment with clean DTO and extended valid fields", async () => {
      const dto = {
        businessId: "biz-1",
        serviceId: "srv-1",
        employeeId: "emp-1",
        date: "2026-10-10",
        startTime: "10:00",
        endTime: "10:30",
        customerName: "Juan Perez",
        customerEmail: "juan@example.com",
        customerPhone: "+5491122334455",
        notes: "Corte clasico",
        status: "confirmed",
        duration: 30,
        price: 2500,
      };

      const result = await service.createAppointment(dto);

      expect(mockPrisma.service.findUnique).toHaveBeenCalledWith({ where: { id: "srv-1" } });
      expect(mockPrisma.appointment.create).toHaveBeenCalledWith({
        data: {
          date: "2026-10-10",
          startTime: "10:00",
          endTime: "10:30",
          status: "confirmed",
          customerName: "Juan Perez",
          customerEmail: "juan@example.com",
          customerPhone: "+5491122334455",
          notes: "Corte clasico",
          businessId: "biz-1",
          employeeId: "emp-1",
          serviceId: "srv-1",
        },
        include: {
          employee: true,
          service: true,
        },
      });
      expect(result.id).toBe("appt-new-1");
      expect(result.status).toBe("confirmed");
      expect(result.notes).toBe("Corte clasico");
    });

    it("controller.create should delegate cleanly to service.createAppointment", async () => {
      const dto = {
        businessId: "biz-1",
        serviceId: "srv-1",
        employeeId: "emp-1",
        date: "2026-10-10",
        startTime: "11:00",
        endTime: "11:30",
        customerName: "Maria Garcia",
        customerEmail: "maria@example.com",
      };

      const result = await controller.create(dto);
      expect(result.id).toBe("appt-new-1");
    });
  });
});
