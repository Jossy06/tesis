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

  async create(body: any, userId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: body.appointment_id,
      },
      relations: {
        client: true,
        details: {
          service: true,
        },
      },
    });

    if (!appointment) {
      throw new BadRequestException('La cita no existe');
    }

    if (!appointment.details || appointment.details.length === 0) {
      throw new BadRequestException(
        'La cita no tiene servicios registrados',
      );
    }

    const existingInvoice = await this.invoiceRepository.findOne({
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

    const ivaPercentage = Number(setting?.iva_percentage ?? 15);
    const subtotal = Number(appointment.subtotal);
    const discount = Number(
      body.discount ?? appointment.discount ?? 0,
    );

    if (discount < 0) {
      throw new BadRequestException(
        'El descuento no puede ser negativo',
      );
    }

    if (discount > subtotal) {
      throw new BadRequestException(
        'El descuento no puede superar el subtotal',
      );
    }

    const taxableAmount = subtotal - discount;
    const iva = Number(
      (taxableAmount * (ivaPercentage / 100)).toFixed(2),
    );
    const total = Number((taxableAmount + iva).toFixed(2));

    const invoiceNumber =
      await this.generateInvoiceNumber();

    const invoice = this.invoiceRepository.create({
      invoice_number: invoiceNumber,
      client_id: appointment.client_id,
      created_by_user_id: userId,
      appointment_id: appointment.id,
      subtotal,
      iva,
      discount,
      total,
      status: body.status ?? 'Pendiente',
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    const invoiceDetails = appointment.details.map((detail) => {
      const quantity = Number(detail.quantity);
      const unitPrice = Number(detail.price);

      return this.invoiceDetailRepository.create({
        invoice_id: savedInvoice.id,
        service_id: detail.service_id,
        quantity,
        unit_price: unitPrice,
        subtotal: Number((unitPrice * quantity).toFixed(2)),
      });
    });

    await this.invoiceDetailRepository.save(invoiceDetails);

    return this.findOne(savedInvoice.id);
  }

  async findAll() {
    return this.invoiceRepository.find({
      relations: {
        client: true,
        created_by: true,
        appointment: {
          details: {
            service: true,
          },
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id,
      },
      relations: {
        client: true,
        created_by: true,
        appointment: {
          details: {
            service: true,
          },
        },
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

    return this.invoiceRepository.save(invoice);
  }

  async remove(
    id: string,
  ): Promise<{ message: string }> {
    const invoice =
      await this.invoiceRepository.findOne({
        where: { id },
      });

    if (!invoice) {
      throw new NotFoundException(
        'Factura no encontrada',
      );
    }

    await this.invoiceDetailRepository.delete({
      invoice_id: invoice.id,
    });

    await this.invoiceRepository.delete(
      invoice.id,
    );

    return {
      message: 'Factura eliminada correctamente',
    };
  }


  async generatePdf(id: string, res: Response) {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id,
      },
      relations: {
        client: true,
        created_by: true,
        appointment: {
          details: {
            service: true,
          },
        },
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

    const setting = await this.settingRepository.findOne({
      where: {},
      order: {
        created_at: 'ASC',
      },
    });

    const businessName =
      setting?.business_name ?? "Kathy's Nails";

    const businessPhone =
      setting?.phone ?? 'N/A';

    const businessEmail =
      setting?.email ?? 'N/A';

    const businessAddress =
      setting?.address ?? 'Quito, Ecuador';

    const businessRuc =
      setting?.ruc ?? 'N/A';

    const ivaPercentage =
      Number(setting?.iva_percentage ?? 15);

    const terms =
      setting?.terms_conditions?.trim() ||
      [
        'Los servicios serán realizados por profesionales capacitados.',
        'Cualquier cambio o cancelación debe realizarse con al menos 24 horas de anticipación.',
        'El cliente debe informar sobre alergias o condiciones médicas relevantes.',
        'El salón no se responsabiliza por reacciones derivadas de información no proporcionada.',
      ].join('\n');

    const doc = new PDFDocument({
      margin: 0,
      size: 'A4',
      bufferPages: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${invoice.invoice_number}.pdf`,
    );

    doc.pipe(res);

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const marginX = 44;
    const contentWidth = pageWidth - marginX * 2;

    const colors = {
      text: '#2f2b2d',
      muted: '#6f676b',
      pink: '#fbe7e7',
      pinkStrong: '#e8b9c7',
      line: '#f0d5dc',
      white: '#ffffff',
    };

    const money = (value: number | string) =>
      new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(Number(value ?? 0));

    const dateText = new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(invoice.created_at));

    const drawPageBackground = () => {
      doc
        .rect(0, 0, pageWidth, pageHeight)
        .fill(colors.white);
    };

    const drawHeader = () => {
      drawPageBackground();

      doc
        .fillColor(colors.text)
        .font('Helvetica')
        .fontSize(40)
        .text('F A C T U R A', marginX, 46, {
          width: 355,
          characterSpacing: 2,
        });

      doc
        .fillColor(colors.pink)
        .fontSize(88)
        .text('K', pageWidth - 115, 20, {
          width: 70,
          align: 'center',
        });

      doc
        .fillColor(colors.text)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(
          businessName.toUpperCase(),
          pageWidth - 190,
          42,
          {
            width: 140,
            align: 'right',
          },
        );

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(colors.muted)
        .text(
          `RUC: ${businessRuc}
${businessPhone}
${businessAddress}
${businessEmail}`,
          pageWidth - 215,
          64,
          {
            width: 165,
            align: 'right',
            lineGap: 2,
          },
        );

      doc
        .rect(marginX, 118, 178, 24)
        .fill(colors.pink);

      doc
        .fillColor(colors.text)
        .font('Helvetica')
        .fontSize(8.5)
        .text(
          `NÚMERO DE FACTURA ${invoice.invoice_number}`,
          marginX + 10,
          126,
          {
            width: 160,
          },
        );

      doc
        .rect(marginX + 188, 118, 180, 24)
        .fill(colors.pink);

      doc
        .fillColor(colors.text)
        .fontSize(8.5)
        .text(
          dateText.toUpperCase(),
          marginX + 198,
          126,
          {
            width: 160,
          },
        );
    };

    const drawClientSection = () => {
      doc
        .fillColor(colors.text)
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('CLIENTE:', marginX, 190);

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(colors.text)
        .text(
          invoice.client?.name ?? 'N/A',
          marginX,
          218,
        );

      doc
        .fillColor(colors.muted)
        .text(
          invoice.client?.email ?? 'Sin correo',
          marginX,
          236,
        );

      doc.text(
        invoice.client?.phone ?? 'Sin teléfono',
        marginX,
        254,
      );

      if (invoice.client?.address) {
        doc.text(
          invoice.client.address,
          marginX,
          272,
          {
            width: 280,
          },
        );
      }
    };

    const drawTableHeader = (y: number) => {
      doc
        .rect(marginX, y, contentWidth, 34)
        .fill(colors.pink);

      doc
        .fillColor(colors.text)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(
          'DESCRIPCIÓN DE LOS SERVICIOS',
          marginX + 22,
          y + 12,
          {
            width: 270,
          },
        )
        .text(
          'CANTIDAD',
          marginX + 330,
          y + 12,
          {
            width: 75,
            align: 'center',
          },
        )
        .text(
          'PRECIO',
          marginX + 420,
          y + 12,
          {
            width: 70,
            align: 'right',
          },
        );
    };

    const drawTotals = (startY: number) => {
      const boxWidth = 215;
      const boxX =
        pageWidth - marginX - boxWidth;
      const boxHeight =
        Number(invoice.discount) > 0
          ? 112
          : 92;

      doc
        .rect(
          boxX,
          startY,
          boxWidth,
          boxHeight,
        )
        .lineWidth(1)
        .strokeColor(colors.line)
        .stroke();

      const labelX = boxX + 18;
      const valueX = boxX + 120;

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(colors.text)
        .text(
          'Subtotal:',
          labelX,
          startY + 15,
          {
            width: 90,
            align: 'right',
          },
        )
        .text(
          money(invoice.subtotal),
          valueX,
          startY + 15,
          {
            width: 76,
            align: 'right',
          },
        );

      let lineY = startY + 37;

      if (Number(invoice.discount) > 0) {
        doc
          .text(
            'Descuento:',
            labelX,
            lineY,
            {
              width: 90,
              align: 'right',
            },
          )
          .text(
            `- ${money(invoice.discount)}`,
            valueX,
            lineY,
            {
              width: 76,
              align: 'right',
            },
          );

        lineY += 22;
      }

      doc
        .text(
          `IVA ${ivaPercentage}%:`,
          labelX,
          lineY,
          {
            width: 90,
            align: 'right',
          },
        )
        .text(
          money(invoice.iva),
          valueX,
          lineY,
          {
            width: 76,
            align: 'right',
          },
        );

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(
          'TOTAL:',
          labelX,
          lineY + 28,
          {
            width: 90,
            align: 'right',
          },
        )
        .text(
          money(invoice.total),
          valueX,
          lineY + 28,
          {
            width: 76,
            align: 'right',
          },
        );

      return startY + boxHeight;
    };

    const drawTerms = (startY: number) => {
      const boxY = Math.max(startY, 690);
      const boxHeight =
        pageHeight - boxY - 36;

      doc
        .rect(
          marginX,
          boxY,
          contentWidth,
          boxHeight,
        )
        .fill(colors.pink);

      doc
        .fillColor(colors.text)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(
          'TÉRMINOS Y CONDICIONES:',
          marginX + 22,
          boxY + 18,
          {
            width: contentWidth - 44,
          },
        );

      const formattedTerms = terms
        .split('\n')
        .map((line) => {
          const cleanLine = line.trim();

          if (!cleanLine) {
            return '';
          }

          return cleanLine.startsWith('-')
            ? cleanLine
            : `- ${cleanLine}`;
        })
        .filter(Boolean)
        .join('\n');

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(colors.text)
        .text(
          formattedTerms,
          marginX + 22,
          boxY + 42,
          {
            width: contentWidth - 44,
            lineGap: 3,
          },
        );
    };

    drawHeader();
    drawClientSection();

    let tableY = 320;
    drawTableHeader(tableY);

    let rowY = tableY + 44;

    if (details.length === 0) {
      doc
        .fillColor(colors.muted)
        .font('Helvetica')
        .fontSize(10)
        .text(
          'No existen servicios registrados.',
          marginX + 22,
          rowY,
          {
            width: contentWidth - 44,
          },
        );

      rowY += 30;
    } else {
      for (const detail of details) {
        const serviceName =
          detail.service?.name ??
          'Servicio';

        const quantity =
          Number(detail.quantity ?? 0);

        const unitPrice =
          Number(detail.unit_price ?? 0);

        const rowHeight = Math.max(
          30,
          doc.heightOfString(
            serviceName,
            {
              width: 285,
            },
          ) + 16,
        );

        if (rowY + rowHeight > 630) {
          doc.addPage();
          drawHeader();

          tableY = 170;
          drawTableHeader(tableY);
          rowY = tableY + 44;
        }

        doc
          .fillColor(colors.text)
          .font('Helvetica')
          .fontSize(9.5)
          .text(
            serviceName,
            marginX + 22,
            rowY,
            {
              width: 285,
            },
          )
          .text(
            String(quantity),
            marginX + 330,
            rowY,
            {
              width: 75,
              align: 'center',
            },
          )
          .text(
            money(unitPrice),
            marginX + 420,
            rowY,
            {
              width: 70,
              align: 'right',
            },
          );

        doc
          .moveTo(
            marginX + 5,
            rowY + rowHeight - 6,
          )
          .lineTo(
            marginX + contentWidth,
            rowY + rowHeight - 6,
          )
          .lineWidth(0.7)
          .strokeColor(colors.line)
          .stroke();

        rowY += rowHeight;
      }
    }

    const totalsEndY = drawTotals(
      rowY + 14,
    );

    drawTerms(
      totalsEndY + 30,
    );

    doc.end();
  }

  /**
   * Genera números como FAC-20260804-001.
   * El consecutivo vuelve a 001 cada día.
   */
  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const datePart = `${year}${month}${day}`;
    const prefix = `FAC-${datePart}-`;

    const existingInvoices =
      await this.invoiceRepository
        .createQueryBuilder('invoice')
        .select(
          'invoice.invoice_number',
          'invoice_number',
        )
        .where(
          'invoice.invoice_number LIKE :prefix',
          {
            prefix: `${prefix}%`,
          },
        )
        .getRawMany<{
          invoice_number: string;
        }>();

    const pattern = new RegExp(
      `^FAC-${datePart}-(\\d{3,})$`,
    );

    let highestSequence = 0;

    for (const item of existingInvoices) {
      const match = item.invoice_number.match(pattern);

      if (!match) {
        continue;
      }

      const sequence = Number(match[1]);

      if (
        !Number.isNaN(sequence) &&
        sequence > highestSequence
      ) {
        highestSequence = sequence;
      }
    }

    const nextSequence = highestSequence + 1;

    const invoiceNumber =
      `${prefix}${String(nextSequence).padStart(3, '0')}`;

    console.log(
      'Número de factura generado:',
      invoiceNumber,
    );

    return invoiceNumber;
  }

}
