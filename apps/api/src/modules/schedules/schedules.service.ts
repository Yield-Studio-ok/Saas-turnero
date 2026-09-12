import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkBusinessOwnership(userId: string, businessId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException("Business not found");
    if (business.ownerId !== userId) {
      throw new ForbiddenException("You do not have permission to manage this Business");
    }
  }

  async create(userId: string, createScheduleDto: CreateScheduleDto) {
    await this.checkBusinessOwnership(userId, createScheduleDto.businessId);

    // Check if employee exists and belongs to the same business
    const employee = await this.prisma.employee.findUnique({
      where: { id: createScheduleDto.employeeId },
    });
    if (!employee || employee.businessId !== createScheduleDto.businessId) {
      throw new NotFoundException("Employee not found in this Business");
    }

    return this.prisma.schedule.create({ data: createScheduleDto });
  }

  async bulkCreate(userId: string, createScheduleDtos: CreateScheduleDto[]) {
    if (createScheduleDtos.length === 0) return { count: 0 };

    const businessId = createScheduleDtos[0].businessId;
    await this.checkBusinessOwnership(userId, businessId);

    // Verify all belong to same business
    for (const dto of createScheduleDtos) {
      if (dto.businessId !== businessId) {
        throw new ForbiddenException(
          "Bulk create requires all schedules to belong to the same business",
        );
      }
    }

    return this.prisma.schedule.createMany({
      data: createScheduleDtos,
    });
  }

  async findAllByBusiness(userId: string, businessId: string) {
    await this.checkBusinessOwnership(userId, businessId);
    return this.prisma.schedule.findMany({ where: { businessId } });
  }

  async findOne(userId: string, id: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException("Schedule not found");
    await this.checkBusinessOwnership(userId, schedule.businessId);
    return schedule;
  }

  async update(userId: string, id: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.findOne(userId, id); // validates ownership
    if (updateScheduleDto.businessId && updateScheduleDto.businessId !== schedule.businessId) {
      await this.checkBusinessOwnership(userId, updateScheduleDto.businessId);
    }
    return this.prisma.schedule.update({
      where: { id },
      data: updateScheduleDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // validates ownership
    return this.prisma.schedule.delete({ where: { id } });
  }
}
