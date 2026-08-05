import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  CalculationsService,
} from './calculations.service';

import {
  CreateCalculationDto,
} from './dto/create-calculation.dto';

@UseGuards(JwtAuthGuard)
@Controller('calculations')
export class CalculationsController {
  constructor(
    private readonly calculationsService:
      CalculationsService,
  ) {}

  @Post()
  create(
    @Body()
    createCalculationDto:
      CreateCalculationDto,

    @Req()
    req: any,
  ) {
    return this.calculationsService.create(
      createCalculationDto,
      req.user.id,
    );
  }

  @Get()
  findAll() {
    return this.calculationsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.calculationsService.findOne(
      id,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.calculationsService.remove(
      id,
    );
  }
}
