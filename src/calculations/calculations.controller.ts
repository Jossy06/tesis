import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { CalculationsService } from './calculations.service';
import { CreateCalculationDto } from './dto/create-calculation.dto';

@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calculationsService: CalculationsService) {}

  @Post()
  create(@Body() createCalculationDto: CreateCalculationDto) {
    return this.calculationsService.create(createCalculationDto);
  }

  @Get()
  findAll() {
    return this.calculationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calculationsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calculationsService.remove(id);
  }
}
