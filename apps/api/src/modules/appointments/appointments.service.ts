import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FirebaseService } from "../auth/firebase.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { calculateAvailableSlots, TimeSlot } from "../../utils/availability.engine";

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseService,
  ) {}

  async createAppointment(dto: CreateAppointmentDto) {
    const { localId, employeeId, serviceId, date, startTime, endTime } = dto;

    // 1. Validate entities
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.localId !== localId)
      throw new NotFoundException("Service not found for this local");

    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.localId !== localId)
      throw new NotFoundException("Employee not found for this local");

    // Get day of week (0 = Sunday, 1 = Monday)
    const dayOfWeek = new Date(date).getDay();

    // Get schedule for that day
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

    // 2. Start Firestore transaction
    const db = this.firebase.getFirestore();
    const appointmentsRef = db.collection("appointments");

    try {
      const result = await db.runTransaction(async (t) => {
        // Query existing appointments for the same date and employee
        // Note: Firestore transactions require reads before writes.
        // We do a query inside transaction (requires all returned docs to not change)
        const querySnapshot = await t.get(
          appointmentsRef.where("employeeId", "==", employeeId).where("date", "==", date),
        );

        const existingAppointments: TimeSlot[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status !== "Cancelado" && data.status !== "cancelado") {
            existingAppointments.push({
              startTime: data.startTime,
              endTime: data.endTime,
            });
          }
        });

        // 3. Re-validate availability
        const availableSlots = calculateAvailableSlots({
          workingHours,
          appointments: existingAppointments,
          serviceDuration: service.duration,
          // interval could be service.duration
          slotInterval: service.duration,
        });

        const isAvailable = availableSlots.some(
          (slot) => slot.startTime === startTime && slot.endTime === endTime,
        );

        if (!isAvailable) {
          throw new BadRequestException("The selected time slot is no longer available");
        }

        // 4. Save the document
        const newDocRef = appointmentsRef.doc();
        const appointmentData = {
          ...dto,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        };
        t.set(newDocRef, appointmentData);

        return { id: newDocRef.id, ...appointmentData };
      });

      return result;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Failed to create appointment: " + error.message);
    }
  }

  async cancelAppointment(id: string, reason?: string) {
    const db = this.firebase.getFirestore();
    const appointmentRef = db.collection("appointments").doc(id);
    const doc = await appointmentRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    const updateData: Record<string, any> = {
      status: "Cancelado",
      updatedAt: new Date().toISOString(),
      cancelledAt: new Date().toISOString(),
    };

    if (reason) {
      updateData.cancellationReason = reason;
    }

    await appointmentRef.update(updateData);

    return {
      id: doc.id,
      ...doc.data(),
      ...updateData,
    };
  }

  async cancel(id: string, reason?: string) {
    return this.cancelAppointment(id, reason);
  }

  async getAppointmentById(id: string) {
    const db = this.firebase.getFirestore();
    const doc = await db.collection("appointments").doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  }
}
