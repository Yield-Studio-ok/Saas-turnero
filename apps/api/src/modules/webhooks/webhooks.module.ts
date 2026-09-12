import { Module } from "@nestjs/common";
import { WebhooksController } from "./webhooks.controller";
import { AppointmentsModule } from "../appointments/appointments.module";

@Module({
  imports: [AppointmentsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
