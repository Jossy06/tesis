import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalculationsController } from './calculations.controller';
import { CalculationsService } from './calculations.service';

import { Calculation } from './entities/calculation.entity';
import { ServiceMaterial } from '../service-materials/entities/service-material.entity';
import { BeautyService } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Calculation,
      ServiceMaterial,
      BeautyService,
    ]),
  ],
  controllers: [
    CalculationsController,
  ],
  providers: [
    CalculationsService,
  ],
  exports: [
    CalculationsService,
  ],
})
export class CalculationsModule {}