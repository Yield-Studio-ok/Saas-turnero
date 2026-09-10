import { Module } from "@nestjs/common";
import { LocalesController } from "./locales.controller";
import { LocalesService } from "./locales.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [LocalesController],
  providers: [LocalesService],
  exports: [LocalesService],
})
export class LocalesModule {}
