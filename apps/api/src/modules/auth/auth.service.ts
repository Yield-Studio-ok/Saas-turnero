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

    let tenantId = user.businesses?.[0]?.id;
    let businessName = user.businesses?.[0]?.name;
    let employeeId: string | undefined = undefined;

    if (user.role === "employee" || !tenantId) {
      const employee = await this.prisma.employee.findFirst({
        where: { email: user.email },
        include: { business: true },
      });
      if (employee) {
        employeeId = employee.id;
        if (!tenantId) {
          tenantId = employee.businessId;
          businessName = employee.business?.name;
        }
      }
    }

    const userPlan = user.businesses?.[0]?.plan || undefined;

    const authUser: AuthUser = {
      uid: user.id,
      email: user.email,
      name: user.name || undefined,
      businessName: businessName || undefined,
      role: user.role,
      tenantId: tenantId,
      plan: userPlan,
      employeeId: employeeId,
    };

    return {
      accessToken: this.jwt.sign({
        sub: authUser.uid,
        email: authUser.email,
        name: authUser.name,
        businessName: authUser.businessName,
        role: authUser.role,
        tenantId: authUser.tenantId,
        plan: authUser.plan,
        employeeId: authUser.employeeId,
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
      name?: string;
      businessName?: string;
      role: string;
      tenantId?: string;
      plan?: string;
      employeeId?: string;
    }>(token);

    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
      businessName: payload.businessName,
      role: payload.role,
      tenantId: payload.tenantId,
      plan: payload.plan,
      employeeId: payload.employeeId,
    };
  }
}
