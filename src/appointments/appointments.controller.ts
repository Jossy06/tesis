import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  AppointmentsService,
} from './appointments.service';

import {
  CreateAppointmentDto,
} from './dto/create-appointment.dto';

import {
  UpdateAppointmentDto,
} from './dto/update-appointment.dto';

import {
  AppointmentQueryDto,
} from './dto/appointment-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService:
      AppointmentsService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateAppointmentDto,

    @Req()
    req: any,
  ) {
    return this.appointmentsService.create(
      dto,
      req.user.id,
    );
  }

  @Get()
  findAll(
    @Query()
    query: AppointmentQueryDto,
  ) {
    return this.appointmentsService.findAll(
      query,
    );
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.appointmentsService.findOne(
      id,
    );
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Body()
    dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.appointmentsService.remove(
      id,
    );
  }
}
