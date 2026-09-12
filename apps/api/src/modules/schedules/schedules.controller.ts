import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ParseArrayPipe,
} from "@nestjs/common";
import { SchedulesService } from "./schedules.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiBody } from "@nestjs/swagger";
import { Request } from "express";
import { AuthUser } from "../auth/auth.types";

@ApiTags("Schedules")
@ApiBearerAuth()
@Controller("schedules")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: "Create a schedule" })
  create(@Req() req: Request, @Body() createScheduleDto: CreateScheduleDto) {
    const user = req.user as AuthUser;
    return this.schedulesService.create(user.uid, createScheduleDto);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Bulk create schedules" })
  @ApiBody({ type: [CreateScheduleDto] })
  bulkCreate(
    @Req() req: Request,
    @Body(new ParseArrayPipe({ items: CreateScheduleDto })) createScheduleDtos: CreateScheduleDto[],
  ) {
    const user = req.user as AuthUser;
    return this.schedulesService.bulkCreate(user.uid, createScheduleDtos);
  }

  @Get()
  @ApiOperation({ summary: "Get all schedules of a business" })
  @ApiQuery({ name: "businessId", required: true, type: String })
  findAll(@Req() req: Request, @Query("businessId") businessId: string) {
    const user = req.user as AuthUser;
    return this.schedulesService.findAllByBusiness(user.uid, businessId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a schedule by ID" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as AuthUser;
    return this.schedulesService.findOne(user.uid, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a schedule" })
  update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    const user = req.user as AuthUser;
    return this.schedulesService.update(user.uid, id, updateScheduleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a schedule" })
  remove(@Req() req: Request, @Param("id") id: string) {
    const user = req.user as AuthUser;
    return this.schedulesService.remove(user.uid, id);
  }
}
