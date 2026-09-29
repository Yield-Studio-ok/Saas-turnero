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
      },
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: "user-1", email: "cliente@test.com", credits: 0 }),
        update: jest.fn().mockResolvedValue({ id: "user-1", credits: 1500 }),
      },
      service: { findUnique: jest.fn() },
      employee: { findUnique: jest.fn() },
      schedule: { findMany: jest.fn() },
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
});
