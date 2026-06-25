import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { BeautyService } from './entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BeautyService]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}