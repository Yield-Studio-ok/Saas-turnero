import { Controller, Post, Patch, Delete, Get, Param, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { CancelAppointmentDto } from "./dto/cancel-appointment.dto";

@ApiTags("Appointments")
@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: "Create an appointment" })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(createAppointmentDto);
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel an appointment by ID" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  async cancelAppointment(
    @Param("id") id: string,
    @Body() cancelDto?: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancelAppointment(id, cancelDto?.reason);
  }

  @Post(":id/cancel")
  @ApiOperation({ summary: "Cancel an appointment by ID (POST alternative)" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  async cancelAppointmentPost(
    @Param("id") id: string,
    @Body() cancelDto?: CancelAppointmentDto,
  ) {
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
  async updateOrCancel(
    @Param("id") id: string,
    @Body() cancelDto?: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancelAppointment(id, cancelDto?.reason);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an appointment by ID" })
  @ApiParam({ name: "id", description: "Appointment ID" })
  async getAppointment(@Param("id") id: string) {
    return this.appointmentsService.getAppointmentById(id);
  }
}
