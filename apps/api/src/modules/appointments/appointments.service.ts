import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { calculateAvailableSlots, TimeSlot } from "../../utils/availability.engine";

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto) {
    const rawBusinessId = dto.businessId || dto.localId;
    if (!rawBusinessId) {
      throw new BadRequestException("businessId or localId is required");
    }

    // 1. Resolve business
    let biz = await this.prisma.business.findFirst({
      where: {
        OR: [{ id: rawBusinessId }, { name: rawBusinessId }],
      },
    });

    if (!biz) {
      // Fallback for demo-tenant or unknown businessId
      biz = await this.prisma.business.findFirst();
    }

    if (!biz) {
      throw new NotFoundException("Business not found");
    }

    const businessId = biz.id;

    // 2. Resolve service
    const { serviceId, date, startTime, endTime } = dto;
    let service: any = null;

    if (serviceId) {
      service = await this.prisma.service.findUnique({ where: { id: serviceId } });
      if (service && service.businessId !== businessId) {
        service = null;
      }
    }

    // If not found by ID, search by name for this business
    if (!service && (dto.serviceName || serviceId)) {
      const searchName = dto.serviceName || serviceId;
      service = await this.prisma.service.findFirst({
        where: {
          businessId,
          name: { equals: searchName, mode: "insensitive" },
        },
      });
    }

    // If still not found, auto-create the service or pick the first existing service
    if (!service) {
      if (dto.serviceName || (serviceId && serviceId.startsWith("srv_"))) {
        const name = dto.serviceName || "Servicio Walk-in";
        const price = dto.price ?? 3500;
        const duration = dto.duration ?? 30;
        service = await this.prisma.service.create({
          data: {
            name,
            price,
            duration,
            businessId,
          },
        });
      } else {
        service = await this.prisma.service.findFirst({
          where: { businessId },
        });
        if (!service) {
          service = await this.prisma.service.create({
            data: {
              name: dto.serviceName || "Servicio General",
              price: dto.price ?? 3500,
              duration: dto.duration ?? 30,
              businessId,
            },
          });
        }
      }
    }

    // 3. Resolve employee
    let targetEmployeeId = dto.employeeId;
    let employee: any = null;

    if (
      targetEmployeeId &&
      targetEmployeeId !== "general" &&
      !targetEmployeeId.startsWith("emp_mock") &&
      targetEmployeeId !== "emp1" &&
      targetEmployeeId !== "emp2" &&
      targetEmployeeId !== "emp3"
    ) {
      employee = await this.prisma.employee.findUnique({ where: { id: targetEmployeeId } });
      if (employee && employee.businessId !== businessId) {
        employee = null;
      }
    }

    // If employee not resolved yet, pick first employee of the business or match by name
    if (!employee) {
      if (dto.employeeName) {
        employee = await this.prisma.employee.findFirst({
          where: {
            businessId,
            name: { equals: dto.employeeName, mode: "insensitive" },
          },
        });
      }
      if (!employee) {
        employee = await this.prisma.employee.findFirst({
          where: { businessId },
        });
      }
    }

    // If business has no employees yet, auto-create a default employee
    if (!employee) {
      employee = await this.prisma.employee.create({
        data: {
          name: "Personal General",
          businessId,
        },
      });
    }

    const resolvedEmployeeId: string = employee.id;

    // 4. Overlap conflict checking
    const [reqStartH, reqStartM] = startTime.split(":").map(Number);
    const [reqEndH, reqEndM] = endTime.split(":").map(Number);
    const reqStartMin = reqStartH * 60 + reqStartM;
    const reqEndMin = reqEndH * 60 + reqEndM;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existingAppointmentsDoc = await tx.appointment.findMany({
          where: {
            employeeId: resolvedEmployeeId,
            date,
            status: { notIn: ["Cancelado", "cancelado", "cancelled"] },
          },
        });

        const hasOverlap = existingAppointmentsDoc.some((app) => {
          const [appStartH, appStartM] = app.startTime.split(":").map(Number);
          const [appEndH, appEndM] = app.endTime.split(":").map(Number);
          const appStartMin = appStartH * 60 + appStartM;
          const appEndMin = appEndH * 60 + appEndM;
          return Math.max(reqStartMin, appStartMin) < Math.min(reqEndMin, appEndMin);
        });

        if (hasOverlap) {
          throw new BadRequestException(
            "The selected time slot overlaps with an existing appointment",
          );
        }

        return await tx.appointment.create({
          data: {
            date,
            startTime,
            endTime,
            status: dto.status || "confirmed",
            customerName: dto.customerName || "Guest",
            customerEmail: dto.customerEmail || "guest@example.com",
            customerPhone: dto.customerPhone || null,
            notes: dto.notes || null,
            businessId,
            employeeId: resolvedEmployeeId,
            serviceId: service.id,
          },
          include: {
            service: true,
            employee: true,
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
      include: { service: true, employee: true },
      orderBy: { startTime: "asc" },
    });
    return appointments;
  }

  async getAppointmentsByBusiness(businessId: string, date?: string) {
    let biz = await this.prisma.business.findFirst({
      where: { OR: [{ id: businessId }, { name: businessId }] },
    });
    if (!biz) {
      biz = await this.prisma.business.findFirst();
    }
    const resolvedBizId = biz ? biz.id : businessId;

    const where: any = { businessId: resolvedBizId };
    if (date) {
      where.date = date;
    }
    return this.prisma.appointment.findMany({
      where,
      include: {
        service: true,
        employee: true,
      },
      orderBy: { startTime: "asc" },
    });
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
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: "cancelled",
        cancellationReason: reason,
      },
    });

    // Añadir creditos al usuario si existe
    if (appointment.customerEmail) {
      const user = await this.prisma.user.findUnique({
        where: { email: appointment.customerEmail },
      });
      if (user) {
        // sumamos creditos basados en el precio del servicio (o un monto fijo)
        const creditToAdd = appointment.service ? appointment.service.price : 10;
        await this.prisma.user.update({
          where: { id: user.id },
          data: { credits: { increment: creditToAdd } },
        });
      }
    }

    // Mock envio de email
    console.log(`Simulando envio de email de cancelacion a: ${appointment.customerEmail}`);

    return updated;
  }

  async cancel(id: string, reason?: string) {
    return this.cancelAppointment(id, reason);
  }

  async getAppointmentById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });

    if (!appointment) {
      throw new NotFoundException("Appointment with ID ${id} not found");
    }

    return appointment;
  }
}
