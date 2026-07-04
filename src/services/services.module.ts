import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';

import { BeautyService } from './entities/service.entity';
import { ServiceCategory } from '../service-categories/entities/service-category.entity';
import { ServiceGroup } from '../service-groups/entities/service-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BeautyService,
      ServiceCategory,
      ServiceGroup  
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}