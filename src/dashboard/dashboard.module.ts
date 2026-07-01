import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { Client } from '../clients/entities/client.entity';
import { BeautyService } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      BeautyService,
      Appointment,
      Invoice,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}