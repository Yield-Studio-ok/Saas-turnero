import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { calculateAvailableSlots, TimeSlot } from "../../utils/availability.engine";

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto) {
    const { businessId, employeeId, serviceId, date, startTime, endTime } = dto;

    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.businessId !== businessId)
      throw new NotFoundException("Service not found for this local");

    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.businessId !== businessId)
      throw new NotFoundException("Employee not found for this local");

    const dateObj = new Date(date + "T12:00:00Z");
    const dayOfWeek = dateObj.getDay();

    const schedules = await this.prisma.schedule.findMany({
      where: { employeeId, dayOfWeek },
    });

    if (schedules.length === 0) {
      throw new BadRequestException("Employee does not work on this day");
    }

    const workingHours: TimeSlot[] = schedules.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existingAppointmentsDoc = await tx.appointment.findMany({
          where: {
            employeeId,
            date,
            status: { notIn: ["Cancelado", "cancelado"] },
          },
        });

        const existingAppointments: TimeSlot[] = existingAppointmentsDoc.map((data) => ({
          startTime: data.startTime,
          endTime: data.endTime,
        }));

        const availableSlots = calculateAvailableSlots({
          workingHours,
          appointments: existingAppointments,
          serviceDuration: service.duration,
          slotInterval: service.duration,
        });

        const isAvailable = availableSlots.some(
          (slot) => slot.startTime === startTime && slot.endTime === endTime,
        );

        if (!isAvailable) {
          throw new BadRequestException("The selected time slot is no longer available");
        }

        return await tx.appointment.create({
          data: {
            date,
            startTime,
            endTime,
            status: "confirmed",
            customerName: dto.customerName || "Guest",
            customerEmail: dto.customerEmail || "guest@example.com",
            customerPhone: dto.customerPhone || null,
            businessId,
            employeeId,
            serviceId,
          },
        });
      });

      return result;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Failed to create appointment: " + error.message);
    }
  }

  async getAvailableSlots(date: string, employeeId: string, serviceId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException("Employee not found");

    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException("Service not found");

    const dateObj = new Date(date + "T12:00:00Z");
    const dayOfWeek = dateObj.getDay();

    const schedules = await this.prisma.schedule.findMany({
      where: { employeeId, dayOfWeek },
    });

    if (schedules.length === 0) {
      return [];
    }

    const workingHours: TimeSlot[] = schedules.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    const existingAppointmentsDoc = await this.prisma.appointment.findMany({
      where: {
        employeeId,
        date,
        status: { notIn: ["Cancelado", "cancelado"] },
      },
    });

    const existingAppointments: TimeSlot[] = existingAppointmentsDoc.map((data) => ({
      startTime: data.startTime,
      endTime: data.endTime,
    }));

    const availableSlots = calculateAvailableSlots({
      workingHours,
      appointments: existingAppointments,
      serviceDuration: service.duration,
      slotInterval: service.duration,
    });

    return availableSlots;
  }

  async getAppointmentsByEmployeeAndDate(employeeId: string, date: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: { employeeId, date },
      include: { service: true },
      orderBy: { startTime: "asc" },
    });
    return appointments;
  }

  async completeAppointment(
    id: string,
    updateData: { status: string; paidAmount?: number; tip?: number },
  ) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    return await this.prisma.appointment.update({
      where: { id },
      data: {
        status: updateData.status,
        paidAmount: updateData.paidAmount,
        tip: updateData.tip,
      },
    });
  }

  async cancelAppointment(id: string, reason?: string): Promise<Record<string, any>> {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });

    if (!appointment) {
      throw new NotFoundException("Appointment with ID ${id} not found");
    }

    return await this.prisma.appointment.update({
      where: { id },
      data: {
        status: "Cancelado",
        cancellationReason: reason,
      },
    });
  }

  async getAppointmentById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });

    if (!appointment) {
      throw new NotFoundException("Appointment with ID ${id} not found");
    }

    return appointment;
  }
}
