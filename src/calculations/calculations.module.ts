import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalculationsService } from './calculations.service';
import { CalculationsController } from './calculations.controller';

import { ServiceMaterial } from '../service-materials/entities/service-material.entity';
import { BeautyService } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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