import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkLocalOwnership(userId: string, localId: string) {
    const local = await this.prisma.local.findUnique({ where: { id: localId } });
    if (!local) throw new NotFoundException("Local not found");
    if (local.ownerId !== userId) {
      throw new ForbiddenException("You do not have permission to manage this Local");
    }
  }

  async create(userId: string, createEmployeeDto: CreateEmployeeDto) {
    await this.checkLocalOwnership(userId, createEmployeeDto.localId);
    return this.prisma.employee.create({ data: createEmployeeDto });
  }

  async findAllByLocal(userId: string, localId: string) {
    await this.checkLocalOwnership(userId, localId);
    return this.prisma.employee.findMany({ where: { localId } });
  }

  async findOne(userId: string, id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException("Employee not found");
    await this.checkLocalOwnership(userId, employee.localId);
    return employee;
  }

  async update(userId: string, id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(userId, id); // validates ownership
    if (updateEmployeeDto.localId && updateEmployeeDto.localId !== employee.localId) {
      await this.checkLocalOwnership(userId, updateEmployeeDto.localId);
    }
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // validates ownership
    return this.prisma.employee.delete({ where: { id } });
  }
}
