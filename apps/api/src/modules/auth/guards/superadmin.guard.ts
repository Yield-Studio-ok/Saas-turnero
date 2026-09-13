import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class SuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Access denied. User not found.");
    }

    if (user.role !== "superadmin") {
      throw new ForbiddenException("Access denied. Superadmin privileges required.");
    }

    return true;
  }
}
