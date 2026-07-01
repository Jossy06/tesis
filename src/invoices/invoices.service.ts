import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import PDFDocument = require('pdfkit');

import { Invoice } from './entities/invoice.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { InvoiceDetail } from '../invoice-details/entities/invoice-detail.entity';
import { Setting } from '../settings/entities/setting.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(InvoiceDetail)
    private readonly invoiceDetailRepository: Repository<InvoiceDetail>,

    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  async create(body: any) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: body.appointment_id },
      relations: {
        client: true,
        service: true,
      },
    });

    if (!appointment) {
      throw new BadRequestException('La cita no existe');
    }

    const subtotal = Number(appointment.final_price);
    const iva = Number((subtotal * 0.15).toFixed(2));
    const discount = Number(body.discount ?? 0);
    const total = Number((subtotal + iva - discount).toFixed(2));

    const count = await this.invoiceRepository.count();

    const invoiceNumber = `FAC-${String(count + 1).padStart(6, '0')}`;

    const invoice = this.invoiceRepository.create({
      invoice_number: invoiceNumber,
      client_id: appointment.client_id,
      appointment_id: appointment.id,
      subtotal,
      iva,
      discount,
      total,
      status: body.status ?? 'Pendiente',
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    const invoiceDetail = this.invoiceDetailRepository.create({
      invoice_id: savedInvoice.id,
      service_id: appointment.service_id,
      quantity: 1,
      unit_price: appointment.final_price,
      subtotal: appointment.final_price,
    });

    await this.invoiceDetailRepository.save(invoiceDetail);

    return await this.findOne(savedInvoice.id);
  }

  async findAll() {
    return await this.invoiceRepository.find({
      relations: {
        client: true,
        appointment: true,
      },
    });
  }

  async findOne(id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: {
        client: true,
        appointment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    return invoice;
  }

  async update(id: string, body: any) {
    const invoice = await this.findOne(id);

    Object.assign(invoice, body);

    return await this.invoiceRepository.save(invoice);
  }

  async remove(id: string) {
    const invoice = await this.findOne(id);

    await this.invoiceRepository.remove(invoice);

    return {
      message: 'Factura eliminada correctamente',
    };
  }

  async generatePdf(id: string, res: Response) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: {
        client: true,
        appointment: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    const details = await this.invoiceDetailRepository.find({
      where: {
        invoice_id: invoice.id,
      },
      relations: {
        service: true,
      },
    });

    const settings = await this.settingRepository.find({
      take: 1,
    });

    const setting = settings[0];

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${invoice.invoice_number}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(20).text(
      setting?.business_name ?? 'Beauty Cost System',
      { align: 'center' },
    );

    doc.moveDown();

    doc.fontSize(10).text(`RUC: ${setting?.ruc ?? 'N/A'}`);
    doc.text(`Dirección: ${setting?.address ?? 'N/A'}`);
    doc.text(`Teléfono: ${setting?.phone ?? 'N/A'}`);
    doc.text(`Email: ${setting?.email ?? 'N/A'}`);

    doc.moveDown();

    doc.fontSize(16).text('FACTURA', { align: 'center' });

    doc.moveDown();

    doc.fontSize(11).text(`Factura N°: ${invoice.invoice_number}`);
    doc.text(`Fecha: ${new Date(invoice.created_at).toLocaleDateString()}`);
    doc.text(`Estado: ${invoice.status}`);

    doc.moveDown();

    doc.fontSize(13).text('Datos del cliente');
    doc.fontSize(11).text(`Cliente: ${invoice.client?.name}`);
    doc.text(`Teléfono: ${invoice.client?.phone}`);
    doc.text(`Email: ${invoice.client?.email ?? 'N/A'}`);
    doc.text(`Dirección: ${invoice.client?.address ?? 'N/A'}`);

    doc.moveDown();

    doc.fontSize(13).text('Detalle');

    doc.moveDown(0.5);

    details.forEach((detail) => {
      doc.fontSize(11).text(
        `${detail.service.name} | Cantidad: ${detail.quantity} | Precio: $${Number(
          detail.unit_price,
        ).toFixed(2)} | Subtotal: $${Number(detail.subtotal).toFixed(2)}`,
      );
    });

    doc.moveDown();

    doc.fontSize(12).text(`Subtotal: $${Number(invoice.subtotal).toFixed(2)}`, {
      align: 'right',
    });

    doc.text(`Descuento: $${Number(invoice.discount).toFixed(2)}`, {
      align: 'right',
    });

    doc.text(`IVA: $${Number(invoice.iva).toFixed(2)}`, {
      align: 'right',
    });

    doc.fontSize(14).text(`TOTAL: $${Number(invoice.total).toFixed(2)}`, {
      align: 'right',
    });

    doc.moveDown(2);

    doc.fontSize(10).text(
      'Gracias por confiar en nuestros servicios.',
      { align: 'center' },
    );

    doc.end();
  }
}