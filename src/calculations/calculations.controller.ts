import { Controller, Post, Body } from '@nestjs/common';
import { CalculationsService } from './calculations.service';

@Controller('calculations')
export class CalculationsController {
  constructor(
    private readonly calculationsService: CalculationsService,
  ) {}

  @Post()
  calculate(@Body() body: any) {
    return this.calculationsService.calculate(
      body.service_id,
      body.labor,
      body.operational,
      body.desiredProfit,
    );
  }
}