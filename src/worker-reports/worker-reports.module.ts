import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Client,
} from '../clients/entities/client.entity';

import {
  Appointment,
} from '../appointments/entities/appointment.entity';

import {
  Invoice,
} from '../invoices/entities/invoice.entity';

import {
  User,
} from '../users/entities/user.entity';

import {
  WorkerReportsController,
} from './worker-reports.controller';

import {
  WorkerReportsService,
} from './worker-reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Appointment,
      Invoice,
      User,
    ]),
  ],

  controllers: [
    WorkerReportsController,
  ],

  providers: [
    WorkerReportsService,
  ],
})
export class WorkerReportsModule {}
