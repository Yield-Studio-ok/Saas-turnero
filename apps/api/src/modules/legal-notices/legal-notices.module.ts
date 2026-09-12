import { Module } from "@nestjs/common";
import { LegalNoticesService } from "./legal-notices.service";
import { LegalNoticesController } from "./legal-notices.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [LegalNoticesController],
  providers: [LegalNoticesService],
  exports: [LegalNoticesService],
})
export class LegalNoticesModule {}
