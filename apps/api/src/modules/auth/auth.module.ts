import { Module, Global } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../prisma/prisma.module";
import { FirebaseService } from "./firebase.service";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MeController } from "./me.controller";
import { SuperadminGuard } from "./guards/superadmin.guard";

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_SECRET");
        if (!secret) {
          throw new Error("JWT_SECRET is required");
        }
        return {
          secret,
          signOptions: { expiresIn: "7d" },
        };
      },
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [FirebaseService, AuthService, AuthGuard, SuperadminGuard, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [FirebaseService, AuthService, AuthGuard, SuperadminGuard],
})
export class AuthModule {}
