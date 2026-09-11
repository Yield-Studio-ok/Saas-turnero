import { NotFoundException } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsController } from "./appointments.controller";

describe("Appointments Cancellation (Ticket 21)", () => {
  let service: AppointmentsService;
  let controller: AppointmentsController;
  let mockFirestore: any;
  let mockDoc: any;
  let mockAppointmentsRef: any;
  let mockFirebase: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockDoc = {
      exists: true,
      id: "appointment-123",
      data: jest.fn().mockReturnValue({
        localId: "local-1",
        employeeId: "emp-1",
        serviceId: "srv-1",
        date: "2026-09-15",
        startTime: "10:00",
        endTime: "11:00",
        status: "confirmed",
      }),
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockImplementation(async () => mockDoc),
    };

    mockAppointmentsRef = {
      doc: jest.fn().mockReturnValue(mockDoc),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        forEach: jest.fn(),
      }),
    };

    mockFirestore = {
      collection: jest.fn().mockReturnValue(mockAppointmentsRef),
      runTransaction: jest.fn(),
    };

    mockFirebase = {
      getFirestore: jest.fn().mockReturnValue(mockFirestore),
    };

    mockPrisma = {
      service: { findUnique: jest.fn() },
      employee: { findUnique: jest.fn() },
      schedule: { findMany: jest.fn() },
    };

    service = new AppointmentsService(mockPrisma as any, mockFirebase as any);
    controller = new AppointmentsController(service);
  });

  describe("AppointmentsService.cancelAppointment", () => {
    it("should update appointment status to 'Cancelado' and set timestamps", async () => {
      const result = await service.cancelAppointment("appointment-123");

      expect(mockFirestore.collection).toHaveBeenCalledWith("appointments");
      expect(mockAppointmentsRef.doc).toHaveBeenCalledWith("appointment-123");
      expect(mockDoc.get).toHaveBeenCalled();
      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "Cancelado",
          updatedAt: expect.any(String),
          cancelledAt: expect.any(String),
        }),
      );
      expect(result.status).toBe("Cancelado");
      expect(result.id).toBe("appointment-123");
    });

    it("should store cancellationReason if provided", async () => {
      const result = await service.cancelAppointment("appointment-123", "Cliente solicitó reprogramación");

      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "Cancelado",
          cancellationReason: "Cliente solicitó reprogramación",
        }),
      );
      expect(result.cancellationReason).toBe("Cliente solicitó reprogramación");
    });

    it("should throw NotFoundException when appointment document does not exist", async () => {
      mockDoc.exists = false;

      await expect(service.cancelAppointment("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDoc.update).not.toHaveBeenCalled();
    });

    it("should support cancel alias", async () => {
      const result = await service.cancel("appointment-123");
      expect(result.status).toBe("Cancelado");
    });
  });

  describe("AppointmentsController routes", () => {
    it("cancelAppointment PATCH should delegate to service", async () => {
      const result = await controller.cancelAppointment("appointment-123", { reason: "test" });
      expect(result.status).toBe("Cancelado");
    });

    it("cancelAppointmentPost POST should delegate to service", async () => {
      const result = await controller.cancelAppointmentPost("appointment-123");
      expect(result.status).toBe("Cancelado");
    });

    it("cancelAppointmentDelete DELETE should delegate to service", async () => {
      const result = await controller.cancelAppointmentDelete("appointment-123");
      expect(result.status).toBe("Cancelado");
    });

    it("updateOrCancel PATCH should delegate to service", async () => {
      const result = await controller.updateOrCancel("appointment-123");
      expect(result.status).toBe("Cancelado");
    });
  });
});
