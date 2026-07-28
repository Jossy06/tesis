import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Client } from '../clients/entities/client.entity';
import { BeautyService } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(BeautyService)
    private readonly serviceRepository: Repository<BeautyService>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async getDashboard() {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const todayString = this.formatDate(today);

    const [
      totalClients,
      totalServices,
      totalAppointments,
      pendingAppointments,
      appointmentsToday,
      totalInvoices,
      invoices,
    ] = await Promise.all([
      this.clientRepository.count(),

      this.serviceRepository.count(),

      this.appointmentRepository.count(),

      this.appointmentRepository.count({
        where: {
          status: AppointmentStatus.PENDING,
        },
      }),

      this.appointmentRepository.count({
        where: {
          appointment_date: todayString,
        },
      }),

      this.invoiceRepository.count(),

      this.invoiceRepository.find(),
    ]);

    const totalSales = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.total),
      0,
    );

    const salesToday = invoices
      .filter((invoice) => {
        const date = new Date(invoice.created_at);

        return (
          date >= startOfDay &&
          date <= endOfDay
        );
      })
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.total),
        0,
      );

    const salesMonth = invoices
      .filter((invoice) => {
        const date = new Date(invoice.created_at);

        return (
          date >= startOfMonth &&
          date <= endOfMonth
        );
      })
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.total),
        0,
      );

    return {
      totalClients,
      totalServices,
      totalAppointments,
      pendingAppointments,
      appointmentsToday,
      totalInvoices,
      totalSales: Number(
        totalSales.toFixed(2),
      ),
      salesToday: Number(
        salesToday.toFixed(2),
      ),
      salesMonth: Number(
        salesMonth.toFixed(2),
      ),
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      date.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}