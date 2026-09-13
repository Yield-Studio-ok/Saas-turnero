import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AppointmentsService } from "../appointments/appointments.service";

@ApiTags("Webhooks")
@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get("availability")
  @ApiOperation({ summary: "Check availability for external systems (e.g., Google Reserve)" })
  async getAvailability(
    @Query("date") date: string,
    @Query("employeeId") employeeId: string,
    @Query("serviceId") serviceId: string,
  ) {
    if (!date || !employeeId || !serviceId) {
      throw new BadRequestException("Missing required query parameters");
    }
    const slots = await this.appointmentsService.getAvailableSlots(date, employeeId, serviceId);
    return {
      availableSlots: slots,
    };
  }

  @Post("reserve")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Webhook for external booking systems (e.g., Google Reserve, Instagram)",
  })
  async createReserve(@Body() payload: any) {
    const {
      businessId,
      employeeId,
      serviceId,
      date,
      startTime,
      endTime,
      customerName,
      customerEmail,
      customerPhone,
    } = payload;

    if (!businessId || !employeeId || !serviceId || !date || !startTime || !endTime) {
      throw new BadRequestException("Invalid payload");
    }

    const appointment = await this.appointmentsService.createAppointment({
      businessId,
      employeeId,
      serviceId,
      date,
      startTime,
      endTime,
      customerName: customerName || "External Booking",
      customerEmail: customerEmail || "no-reply@external.booking",
      customerPhone,
    });

    return {
      success: true,
      appointmentId: appointment.id,
      status: appointment.status,
    };
  }
}
