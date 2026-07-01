import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { MaterialsModule } from './materials/materials.module';
import { ServiceMaterialsModule } from './service-materials/service-materials.module';
import { CalculationsModule } from './calculations/calculations.module';
import { ClientsModule } from './clients/clients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { InvoicesModule } from './invoices/invoices.module';
import { InvoiceDetailsModule } from './invoice-details/invoice-details.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.get<string>('DB_HOST') || 'localhost',
        port: Number(config.get<string>('DB_PORT') || 5432),

        username: config.get<string>('DB_USERNAME') || 'postgres',
        password: config.get<string>('DB_PASSWORD') || '',

        database: config.get<string>('DB_DATABASE') || 'beauty_cost_system',

        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    UsersModule,
    AuthModule,
    ServicesModule,
    MaterialsModule,
    ServiceMaterialsModule,
    CalculationsModule,
    ClientsModule,
    AppointmentsModule,
    InvoicesModule,
    InvoiceDetailsModule,
    DashboardModule,
    ReportsModule,
    SettingsModule,
  ],
})
export class AppModule {}