import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceDetail } from '../invoice-details/entities/invoice-detail.entity';
import { Client } from '../clients/entities/client.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

interface TopServiceReport {
  service: string;
  timesSold: number;
  income: number;
}

interface TopClientReport {
  client: string;
  appointments: number;
  totalSpent: number;
}

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
    const invoices =
      await this.invoiceRepository.find();

    const totalInvoices = invoices.length;

    const totalSales = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.total),
      0,
    );

    const averageSale =
      totalInvoices > 0
        ? totalSales / totalInvoices
        : 0;

    return {
      totalInvoices,
      totalSales: Number(
        totalSales.toFixed(2),
      ),
      averageSale: Number(
        averageSale.toFixed(2),
      ),
    };
  }

  async getTopServices() {
    const details =
      await this.invoiceDetailRepository.find({
        relations: {
          service: true,
        },
      });

    const report: Record<
      string,
      TopServiceReport
    > = {};

    details.forEach((detail) => {
      if (!detail.service) {
        return;
      }

      const id = detail.service.id;

      if (!report[id]) {
        report[id] = {
          service: detail.service.name,
          timesSold: 0,
          income: 0,
        };
      }

      report[id].timesSold += Number(
        detail.quantity,
      );

      report[id].income += Number(
        detail.subtotal,
      );
    });

    return Object.values(report)
      .map((item) => ({
        ...item,
        income: Number(
          item.income.toFixed(2),
        ),
      }))
      .sort(
        (a, b) =>
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

    const report: Record<
      string,
      TopClientReport
    > = {};

    appointments.forEach(
      (appointment) => {
        if (!appointment.client) {
          return;
        }

        const id = appointment.client.id;

        if (!report[id]) {
          report[id] = {
            client:
              appointment.client.name,
            appointments: 0,
            totalSpent: 0,
          };
        }

        report[id].appointments += 1;

        report[id].totalSpent += Number(
          appointment.total,
        );
      },
    );

    return Object.values(report)
      .map((item) => ({
        ...item,
        totalSpent: Number(
          item.totalSpent.toFixed(2),
        ),
      }))
      .sort(
        (a, b) =>
          b.totalSpent - a.totalSpent,
      );
  }

  async getMonthlySales() {
    const invoices =
      await this.invoiceRepository.find();

    const report: Record<
      string,
      number
    > = {};

    invoices.forEach((invoice) => {
      const date = new Date(
        invoice.created_at,
      );

      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;

      if (!report[month]) {
        report[month] = 0;
      }

      report[month] += Number(
        invoice.total,
      );
    });

    return Object.keys(report)
      .sort()
      .map((month) => ({
        month,
        total: Number(
          report[month].toFixed(2),
        ),
      }));
  }
}