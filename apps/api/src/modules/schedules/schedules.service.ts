import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkLocalOwnership(userId: string, localId: string) {
    const local = await this.prisma.local.findUnique({ where: { id: localId } });
    if (!local) throw new NotFoundException("Local not found");
    if (local.ownerId !== userId) {
      throw new ForbiddenException("You do not have permission to manage this Local");
    }
  }

  async create(userId: string, createScheduleDto: CreateScheduleDto) {
    await this.checkLocalOwnership(userId, createScheduleDto.localId);

    // Check if employee exists and belongs to the same local
    const employee = await this.prisma.employee.findUnique({
      where: { id: createScheduleDto.employeeId },
    });
    if (!employee || employee.localId !== createScheduleDto.localId) {
      throw new NotFoundException("Employee not found in this Local");
    }

    return this.prisma.schedule.create({ data: createScheduleDto });
  }

  async bulkCreate(userId: string, createScheduleDtos: CreateScheduleDto[]) {
    if (createScheduleDtos.length === 0) return { count: 0 };

    const localId = createScheduleDtos[0].localId;
    await this.checkLocalOwnership(userId, localId);

    // Verify all belong to same local
    for (const dto of createScheduleDtos) {
      if (dto.localId !== localId) {
        throw new ForbiddenException(
          "Bulk create requires all schedules to belong to the same local",
        );
      }
    }

    return this.prisma.schedule.createMany({
      data: createScheduleDtos,
    });
  }

  async findAllByLocal(userId: string, localId: string) {
    await this.checkLocalOwnership(userId, localId);
    return this.prisma.schedule.findMany({ where: { localId } });
  }

  async findOne(userId: string, id: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException("Schedule not found");
    await this.checkLocalOwnership(userId, schedule.localId);
    return schedule;
  }

  async update(userId: string, id: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.findOne(userId, id); // validates ownership
    if (updateScheduleDto.localId && updateScheduleDto.localId !== schedule.localId) {
      await this.checkLocalOwnership(userId, updateScheduleDto.localId);
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
