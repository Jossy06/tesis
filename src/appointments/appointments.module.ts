import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

import { Appointment } from './entities/appointment.entity';
import { Client } from '../clients/entities/client.entity';
import { BeautyService } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Client,
      BeautyService,
    ]),
  ],
  controllers: [
    AppointmentsController,
  ],
  providers: [
    AppointmentsService,
  ],
  exports: [
    AppointmentsService,
  ],
})
export class AppointmentsModule {}