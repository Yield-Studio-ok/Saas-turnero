import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../prisma/prisma.service";
import { FirebaseService } from "./firebase.service";
import type { AuthUser } from "./auth.types";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private firebase: FirebaseService,
  ) {}

  async onModuleInit() {
    // Demo users removed
  }

  async login(dto: LoginDto) {
    if (this.firebase.isEnabled()) {
      throw new BadRequestException(
        "Password login is disabled while Firebase Auth is configured. Sign in with Firebase and send the ID token.",
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { businesses: true },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.password || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const authUser: AuthUser = {
      uid: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.businesses?.[0]?.id,
    };

    return {
      accessToken: this.jwt.sign({
        sub: authUser.uid,
        email: authUser.email,
        role: authUser.role,
        tenantId: authUser.tenantId,
      }),
      user: authUser,
    };
  }

  async verifyToken(token: string): Promise<AuthUser> {
    if (this.firebase.isEnabled()) {
      return this.firebase.verifyIdToken(token);
    }

    const payload = this.jwt.verify<{
      sub: string;
      email: string;
      role: string;
      tenantId?: string;
    }>(token);

    return {
      uid: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
