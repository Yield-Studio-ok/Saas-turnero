import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkBusinessOwnership(userId: string, businessId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException("Business not found");
    if (business.ownerId !== userId) {
      throw new ForbiddenException("You do not have permission to manage this Business");
    }
  }

  async create(userId: string, createEmployeeDto: CreateEmployeeDto) {
    await this.checkBusinessOwnership(userId, createEmployeeDto.businessId);
    return this.prisma.employee.create({ data: createEmployeeDto });
  }

  async findAllByBusiness(userId: string, businessId: string) {
    await this.checkBusinessOwnership(userId, businessId);
    return this.prisma.employee.findMany({ where: { businessId }, include: { shifts: { where: { clockOut: null }, take: 1 } } });
  }

  async findOne(userId: string, id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException("Employee not found");
    await this.checkBusinessOwnership(userId, employee.businessId);
    return employee;
  }

  async update(userId: string, id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(userId, id); // validates ownership
    if (updateEmployeeDto.businessId && updateEmployeeDto.businessId !== employee.businessId) {
      await this.checkBusinessOwnership(userId, updateEmployeeDto.businessId);
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
  async toggleShift(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');

    const activeShift = await this.prisma.shift.findFirst({
      where: { employeeId: id, clockOut: null },
      orderBy: { clockIn: 'desc' },
    });

    if (activeShift) {
      return this.prisma.shift.update({
        where: { id: activeShift.id },
        data: { clockOut: new Date() },
      });
    } else {
      return this.prisma.shift.create({
        data: { employeeId: id },
      });
    }
  }
}
