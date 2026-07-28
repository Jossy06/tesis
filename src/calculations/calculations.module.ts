import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalculationsController } from './calculations.controller';
import { CalculationsService } from './calculations.service';
import { Calculation } from './entities/calculation.entity';
import { Client } from '../clients/entities/client.entity';
import { InvoiceDetail } from '../invoice-details/entities/invoice-detail.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { ServiceMaterial } from '../service-materials/entities/service-material.entity';
import { BeautyService } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Calculation,
      ServiceMaterial,
      BeautyService,
      Client,
      Invoice,
      InvoiceDetail,
    ]),
  ],
  controllers: [CalculationsController],
  providers: [CalculationsService],
  exports: [CalculationsService],
})
export class CalculationsModule {}
