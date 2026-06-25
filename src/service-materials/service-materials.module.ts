import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceMaterialsService } from './service-materials.service';
import { ServiceMaterialsController } from './service-materials.controller';

import { ServiceMaterial } from './entities/service-material.entity';

import { BeautyService } from '../services/entities/service.entity';
import { Material } from '../materials/entities/material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceMaterial,
      BeautyService,
      Material,
    ]),
  ],
  controllers: [
    ServiceMaterialsController,
  ],
  providers: [
    ServiceMaterialsService,
  ],
  exports: [
    ServiceMaterialsService,
  ],
})
export class ServiceMaterialsModule {}