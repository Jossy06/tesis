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

  const existingInvoice =
    await this.invoiceRepository.findOne({
      where: {
        appointment_id: appointment.id,
      },
    });

  if (existingInvoice) {
    throw new BadRequestException(
      'Esta cita ya tiene una factura generada',
    );
  }

  const setting = await this.settingRepository.findOne({
    where: {},
  });

  const ivaPercentage = Number(
    setting?.iva_percentage ?? 15,
  );

  const subtotal = Number(appointment.final_price);

  const iva = Number(
    (subtotal * (ivaPercentage / 100)).toFixed(2),
  );

  const discount = Number(body.discount ?? 0);

  const total = Number(
    (subtotal + iva - discount).toFixed(2),
  );

  const lastInvoice = await this.invoiceRepository.findOne({
    where: {},
    order: {
      created_at: 'DESC',
    },
  });

  let nextNumber = 1;

  if (lastInvoice) {
    const lastNumber = Number(
      lastInvoice.invoice_number.replace('FAC-', ''),
    );

    nextNumber = lastNumber + 1;
  }

  const invoiceNumber = `FAC-${String(
    nextNumber,
  ).padStart(6, '0')}`;

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

  const savedInvoice =
    await this.invoiceRepository.save(invoice);

  const invoiceDetail =
    this.invoiceDetailRepository.create({
      invoice_id: savedInvoice.id,
      service_id: appointment.service_id,
      quantity: 1,
      unit_price: appointment.final_price,
      subtotal: appointment.final_price,
    });

  await this.invoiceDetailRepository.save(
    invoiceDetail,
  );

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

    const businessName =
      setting?.business_name ?? "Katty's Nails";

    const doc = new PDFDocument({
      margin: 45,
      size: 'A4',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${invoice.invoice_number}.pdf`,
    );

    doc.pipe(res);

    // Encabezado con fondo
    doc
      .rect(0, 0, 595, 105)
      .fill('#f8c8dc');

    doc
      .fillColor('#7a2e4d')
      .fontSize(26)
      .text(businessName, 45, 25, {
        align: 'center',
      });

    doc
      .fontSize(11)
      .fillColor('#5c5c5c')
      .text('Centro de Belleza', 45, 58, {
        align: 'center',
      });

    doc
      .fontSize(9)
      .fillColor('#333333')
      .text(
        `RUC: ${setting?.ruc ?? 'N/A'} | Tel: ${setting?.phone ?? 'N/A'} | ${setting?.email ?? 'N/A'}`,
        45,
        78,
        { align: 'center' },
      );

    doc
      .text(
        setting?.address ?? 'Quito, Ecuador',
        45,
        92,
        { align: 'center' },
      );

    // Título factura
    doc
      .fillColor('#7a2e4d')
      .fontSize(20)
      .text('FACTURA', 45, 130, {
        align: 'center',
      });

    doc
      .moveTo(45, 160)
      .lineTo(550, 160)
      .strokeColor('#f0a6c1')
      .stroke();

    // Información factura
    doc.fillColor('#000000').fontSize(11);

    doc.text(`Factura N°: ${invoice.invoice_number}`, 45, 180);
    doc.text(
      `Fecha: ${new Date(invoice.created_at).toLocaleDateString()}`,
      45,
      198,
    );
    doc.text(`Estado: ${invoice.status}`, 45, 216);

    // Datos del cliente
    doc
      .fillColor('#7a2e4d')
      .fontSize(13)
      .text('Datos del cliente', 330, 180);

    doc.fillColor('#000000').fontSize(10);
    doc.text(`Cliente: ${invoice.client?.name ?? 'N/A'}`, 330, 202);
    doc.text(`Teléfono: ${invoice.client?.phone ?? 'N/A'}`, 330, 218);
    doc.text(`Email: ${invoice.client?.email ?? 'N/A'}`, 330, 234);
    doc.text(`Dirección: ${invoice.client?.address ?? 'N/A'}`, 330, 250);

    // Tabla
    const tableTop = 300;
    const itemX = 55;
    const qtyX = 290;
    const priceX = 365;
    const subtotalX = 455;

    doc
      .roundedRect(45, tableTop - 10, 505, 26, 6)
      .fill('#7a2e4d');

    doc
      .fillColor('#ffffff')
      .fontSize(10)
      .text('Servicio', itemX, tableTop)
      .text('Cant.', qtyX, tableTop)
      .text('Precio', priceX, tableTop)
      .text('Subtotal', subtotalX, tableTop);

    let y = tableTop + 35;

    details.forEach((detail) => {
      doc
        .fillColor('#000000')
        .fontSize(10)
        .text(detail.service?.name ?? 'Servicio', itemX, y)
        .text(String(detail.quantity), qtyX, y)
        .text(`$${Number(detail.unit_price).toFixed(2)}`, priceX, y)
        .text(`$${Number(detail.subtotal).toFixed(2)}`, subtotalX, y);

      doc
        .moveTo(45, y + 18)
        .lineTo(550, y + 18)
        .strokeColor('#e6e6e6')
        .stroke();

      y += 28;
    });

    y += 15;

    // Totales
    const totalsX = 360;

    doc.fillColor('#000000').fontSize(11);
    doc.text(
      `Subtotal: $${Number(invoice.subtotal).toFixed(2)}`,
      totalsX,
      y,
      { align: 'right' },
    );

    y += 20;

    doc.text(
      `Descuento: $${Number(invoice.discount).toFixed(2)}`,
      totalsX,
      y,
      { align: 'right' },
    );

    y += 20;

    doc.text(
      `IVA: $${Number(invoice.iva).toFixed(2)}`,
      totalsX,
      y,
      { align: 'right' },
    );

    y += 25;

    doc
      .roundedRect(350, y - 8, 200, 30, 6)
      .fill('#f8c8dc');

    doc
      .fillColor('#7a2e4d')
      .fontSize(15)
      .text(
        `TOTAL: $${Number(invoice.total).toFixed(2)}`,
        365,
        y,
        {
          align: 'right',
        },
      );

    // Firma
    doc
      .strokeColor('#999999')
      .moveTo(70, 650)
      .lineTo(230, 650)
      .stroke();

    doc
      .fillColor('#555555')
      .fontSize(10)
      .text('Firma responsable', 95, 660);

    // Pie
    doc
      .fillColor('#7a2e4d')
      .fontSize(11)
      .text('¡Gracias por confiar en Katty’s Nails!', 45, 720, {
        align: 'center',
      });

    doc
      .fillColor('#777777')
      .fontSize(9)
      .text('Belleza en tus manos', 45, 738, {
        align: 'center',
      });

    doc.end();
  }
}