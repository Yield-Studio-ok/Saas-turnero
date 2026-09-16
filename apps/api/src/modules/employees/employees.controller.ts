import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Request } from "express";
import { Public } from "../auth/public.decorator";
import { AuthUser } from "../auth/auth.types";

@ApiTags("Employees")
@ApiBearerAuth()
@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: "Create an employee" })
  create(@Req() req: Request, @Body() createEmployeeDto: CreateEmployeeDto) {
    const user = req.user as AuthUser;
    return this.employeesService.create(user.uid, createEmployeeDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all employees of a business" })
  @ApiQuery({ name: "businessId", required: true, type: String })
  findAll(@Req() req: Request, @Query("businessId") businessId: string) {
    return this.employeesService.findAllByBusiness("public", businessId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an employee by ID" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as AuthUser;
    return this.employeesService.findOne(user.uid, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an employee" })
  update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const user = req.user as AuthUser;
    return this.employeesService.update(user.uid, id, updateEmployeeDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an employee" })
  remove(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as AuthUser;
    return this.employeesService.remove(user.uid, id);
  }
  @Post(":id/shift")
  @ApiOperation({ summary: "Clock in or out for a shift" })
  toggleShift(@Param("id") id: string) {
    return this.employeesService.toggleShift(id);
  }
}
