import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Client } from '../clients/entities/client.entity';
import { BeautyService } from '../services/entities/service.entity';

import { Appointment } from './entities/appointment.entity';
import { AppointmentDetail } from './entities/appointment-detail.entity';

import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AppointmentDetail,
      Client,
      BeautyService,
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}