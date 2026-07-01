import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Client } from '../clients/entities/client.entity';
import { BeautyService } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
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
    const totalClients = await this.clientRepository.count();

    const totalServices = await this.serviceRepository.count();

    const totalAppointments = await this.appointmentRepository.count();

    const pendingAppointments =
      await this.appointmentRepository.count({
        where: {
          status: 'Pendiente',
        },
      });

    const totalInvoices =
      await this.invoiceRepository.count();

    const invoices =
      await this.invoiceRepository.find();

    const totalSales = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.total),
      0,
    );

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

    const appointmentsToday =
      await this.appointmentRepository.count({
        where: {
          appointment_date: Between(
            startOfDay,
            endOfDay,
          ),
        },
      });

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
}