import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceDetail } from '../invoice-details/entities/invoice-detail.entity';
import { Client } from '../clients/entities/client.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(InvoiceDetail)
    private readonly invoiceDetailRepository: Repository<InvoiceDetail>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async getSalesReport() {
    const invoices = await this.invoiceRepository.find();

    const totalInvoices = invoices.length;

    const totalSales = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.total),
      0,
    );

    const averageSale =
      totalInvoices > 0
        ? totalSales / totalInvoices
        : 0;

    return {
      totalInvoices,
      totalSales: Number(totalSales.toFixed(2)),
      averageSale: Number(averageSale.toFixed(2)),
    };
  }

  async getTopServices() {
    const details =
      await this.invoiceDetailRepository.find({
        relations: {
          service: true,
        },
      });

    const report = {};

    details.forEach((detail) => {
      const id = detail.service.id;

      if (!report[id]) {
        report[id] = {
          service: detail.service.name,
          timesSold: 0,
          income: 0,
        };
      }

      report[id].timesSold += detail.quantity;
      report[id].income += Number(detail.subtotal);
    });

    return Object.values(report).sort(
      (a: any, b: any) =>
        b.timesSold - a.timesSold,
    );
  }

  async getTopClients() {
    const appointments =
      await this.appointmentRepository.find({
        relations: {
          client: true,
        },
      });

    const report = {};

    appointments.forEach((appointment) => {
      const id = appointment.client.id;

      if (!report[id]) {
        report[id] = {
          client: appointment.client.name,
          appointments: 0,
          totalSpent: 0,
        };
      }

      report[id].appointments++;

      report[id].totalSpent += Number(
        appointment.final_price,
      );
    });

    return Object.values(report).sort(
      (a: any, b: any) =>
        b.appointments - a.appointments,
    );
  }

  async getMonthlySales() {
    const invoices =
      await this.invoiceRepository.find();

    const report = {};

    invoices.forEach((invoice) => {
      const date = new Date(invoice.created_at);

      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      if (!report[month]) {
        report[month] = 0;
      }

      report[month] += Number(invoice.total);
    });

    return Object.keys(report).map(
      (month) => ({
        month,
        total: Number(report[month].toFixed(2)),
      }),
    );
  }
}