import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AuthGuard as JwtAuthGuard } from "../auth/auth.guard";
import { SuperadminGuard } from "../auth/guards/superadmin.guard";
import { UpdatePlanDto } from "./dto/update-plan.dto";
import { CreateAdminBusinessDto } from "./dto/create-admin-business.dto";

@Controller("admin")
@UseGuards(JwtAuthGuard, SuperadminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("businesses")
  async getBusinesses(@Query("page") page?: string, @Query("limit") limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    return this.adminService.getAllBusinesses(pageNumber, limitNumber);
  }

  @Post("businesses")
  async createBusiness(@Body() createAdminBusinessDto: CreateAdminBusinessDto) {
    return this.adminService.createBusiness(createAdminBusinessDto);
  }

  @Patch("businesses/:id/plan")
  async updateBusinessPlan(@Param("id") id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.adminService.updateBusinessPlan(id, updatePlanDto.plan);
  }

  @Get("metrics")
  async getMetrics() {
    return this.adminService.getMetrics();
  }
}
