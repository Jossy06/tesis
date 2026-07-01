import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';

import { Invoice } from './entities/invoice.entity';
import { InvoiceDetail } from '../invoice-details/entities/invoice-detail.entity';
import { Client } from '../clients/entities/client.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Setting } from '../settings/entities/setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceDetail,
      Client,
      Appointment,
      Setting,
    ]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}