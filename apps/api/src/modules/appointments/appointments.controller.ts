import { Controller, Post, Patch, Delete, Get, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { CancelAppointmentDto } from "./dto/cancel-appointment.dto";

export class CompleteAppointmentDto {
  status: string;
  paidAmount?: number;
  tip?: number;
}

@ApiTags("Appointments")
@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get("available-slots")
  @ApiOperation({ summary: "Get available slots for booking" })
  @ApiQuery({ name: "date", description: "Date in YYYY-MM-DD format" })
  @ApiQuery({ name: "employeeId", description: "ID of the employee" })
  @ApiQuery({ name: "serviceId", description: "ID of the service" })
  async getAvailableSlots(
    @Query("date") date: string,
    @Query("employeeId") employeeId: string,
    @Query("serviceId") serviceId: string,
  ) {
    return this.appointmentsService.getAvailableSlots(date, employeeId, serviceId);
  }

  @Get("by-employee")
  @ApiOperation({ summary: "Get appointments by employee and date" })
  @ApiQuery({ name: "date", description: "Date in YYYY-MM-DD format" })
  @ApiQuery({ name: "employeeId", description: "ID of the employee" })
  async getByEmployeeAndDate(@Query("date") date: string, @Query("employeeId") employeeId: string) {
    return this.appointmentsService.getAppointmentsByEmployeeAndDate(employeeId, date);
  }

  @Post()
  @ApiOperation({ summary: "Create an appointment" })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(createAppointmentDto);
  }

  @Patch(":id/complete")
  @ApiOperation({ summary: "Complete an appointment" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  async completeAppointment(@Param("id") id: string, @Body() completeDto: CompleteAppointmentDto) {
    return this.appointmentsService.completeAppointment(id, completeDto);
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel an appointment by ID" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  async cancelAppointment(@Param("id") id: string, @Body() cancelDto?: CancelAppointmentDto) {
    return this.appointmentsService.cancelAppointment(id, cancelDto?.reason);
  }

  @Post(":id/cancel")
  @ApiOperation({ summary: "Cancel an appointment by ID (POST alternative)" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  async cancelAppointmentPost(@Param("id") id: string, @Body() cancelDto?: CancelAppointmentDto) {
    return this.appointmentsService.cancelAppointment(id, cancelDto?.reason);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Cancel an appointment by ID (DELETE alternative)" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  async cancelAppointmentDelete(@Param("id") id: string) {
    return this.appointmentsService.cancelAppointment(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update or cancel an appointment by ID" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  async updateOrCancel(@Param("id") id: string, @Body() cancelDto?: CancelAppointmentDto) {
    return this.appointmentsService.cancelAppointment(id, cancelDto?.reason);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an appointment by ID" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  async getAppointment(@Param("id") id: string) {
    return this.appointmentsService.getAppointmentById(id);
  }
}
