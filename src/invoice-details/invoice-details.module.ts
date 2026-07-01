import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvoiceDetailsService } from './invoice-details.service';
import { InvoiceDetailsController } from './invoice-details.controller';

import { InvoiceDetail } from './entities/invoice-detail.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { BeautyService } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceDetail,
      Invoice,
      BeautyService,
    ]),
  ],
  controllers: [InvoiceDetailsController],
  providers: [InvoiceDetailsService],
})
export class InvoiceDetailsModule {}