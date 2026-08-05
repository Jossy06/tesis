import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Between,
  Repository,
} from 'typeorm';

import {
  Response,
} from 'express';

import PDFDocument = require('pdfkit');

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

@Injectable()
export class WorkerReportsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository:
      Repository<Client>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository:
      Repository<Appointment>,

    @InjectRepository(Invoice)
    private readonly invoiceRepository:
      Repository<Invoice>,

    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,
  ) {}

  async getMyReport(
    userId: string,
    from?: string,
    to?: string,
  ) {
    const clientWhere:
      Record<string, unknown> = {
        created_by_user_id:
          userId,
      };

    const appointmentWhere:
      Record<string, unknown> = {
        created_by_user_id:
          userId,
      };

    const invoiceWhere:
      Record<string, unknown> = {
        created_by_user_id:
          userId,
      };

    if (from && to) {
      clientWhere[
        'created_at'
      ] = Between(
        new Date(
          `${from}T00:00:00`,
        ),
        new Date(
          `${to}T23:59:59`,
        ),
      );

      appointmentWhere[
        'appointment_date'
      ] = Between(
        from,
        to,
      );

      invoiceWhere[
        'created_at'
      ] = Between(
        new Date(
          `${from}T00:00:00`,
        ),
        new Date(
          `${to}T23:59:59`,
        ),
      );
    }

    const [
      user,
      clients,
      appointments,
      invoices,
    ] = await Promise.all([
      this.userRepository.findOne({
        where: {
          id: userId,
        },
      }),

      this.clientRepository.find({
        where:
          clientWhere as any,

        order: {
          created_at:
            'DESC',
        },
      }),

      this.appointmentRepository.find({
        where:
          appointmentWhere as any,

        relations: {
          client: true,
          categories: true,
        },

        order: {
          appointment_date:
            'DESC',

          start_time:
            'DESC',
        },
      }),

      this.invoiceRepository.find({
        where:
          invoiceWhere as any,

        relations: {
          client: true,
        },

        order: {
          created_at:
            'DESC',
        },
      }),
    ]);

    const totalSales =
      invoices.reduce(
        (
          total,
          invoice,
        ) =>
          total +
          Number(
            invoice.total ??
            0,
          ),
        0,
      );

    return {
      worker: {
        id:
          user?.id ??
          userId,

        name:
          user?.name ??
          'Trabajador',

        email:
          user?.email ??
          '',
      },

      period: {
        from:
          from ??
          null,

        to:
          to ??
          null,
      },

      summary: {
        clientsCreated:
          clients.length,

        appointmentsCreated:
          appointments.length,

        invoicesCreated:
          invoices.length,

        totalSales:
          Number(
            totalSales.toFixed(
              2,
            ),
          ),
      },

      clients,
      appointments,
      invoices,
    };
  }

  async generateMyReportPdf(
    userId: string,
    res: Response,
    from?: string,
    to?: string,
  ): Promise<void> {
    const report =
      await this.getMyReport(
        userId,
        from,
        to,
      );

    const doc =
      new PDFDocument({
        size:
          'A4',

        margin:
          44,
      });

    const fileDate =
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        );

    res.setHeader(
      'Content-Type',
      'application/pdf',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=mi-trabajo-${fileDate}.pdf`,
    );

    doc.pipe(res);

    const money =
      (
        value:
          number,
      ) =>
        new Intl.NumberFormat(
          'es-EC',
          {
            style:
              'currency',

            currency:
              'USD',
          },
        ).format(
          Number(
            value ??
            0,
          ),
        );

    const pageWidth =
      doc.page.width;

    const contentWidth =
      pageWidth -
      88;

    const colors = {
      primary:
        '#b52b6c',

      dark:
        '#4d283b',

      muted:
        '#7e6b75',

      light:
        '#f9e7f0',

      border:
        '#ecd5e1',

      white:
        '#ffffff',
    };

    doc
      .rect(
        0,
        0,
        pageWidth,
        112,
      )
      .fill(
        colors.primary,
      );

    doc
      .fillColor(
        colors.white,
      )
      .font(
        'Helvetica-Bold',
      )
      .fontSize(
        26,
      )
      .text(
        'MI TRABAJO',
        44,
        34,
      );

    doc
      .font(
        'Helvetica',
      )
      .fontSize(
        11,
      )
      .text(
        report.worker.name,
        44,
        69,
      );

    doc
      .fillColor(
        colors.dark,
      )
      .font(
        'Helvetica-Bold',
      )
      .fontSize(
        14,
      )
      .text(
        'Periodo del reporte',
        44,
        140,
      );

    const periodText =
      report.period.from &&
      report.period.to
        ? `${report.period.from} al ${report.period.to}`
        : 'Todos los registros';

    doc
      .font(
        'Helvetica',
      )
      .fontSize(
        10,
      )
      .fillColor(
        colors.muted,
      )
      .text(
        periodText,
        44,
        161,
      );

    const cardWidth =
      (
        contentWidth -
        14
      ) /
      2;

    const cards = [
      {
        label:
          'Clientes registrados',

        value:
          String(
            report.summary.clientsCreated,
          ),
      },
      {
        label:
          'Citas creadas',

        value:
          String(
            report.summary.appointmentsCreated,
          ),
      },
      {
        label:
          'Facturas emitidas',

        value:
          String(
            report.summary.invoicesCreated,
          ),
      },
      {
        label:
          'Total vendido',

        value:
          money(
            report.summary.totalSales,
          ),
      },
    ];

    cards.forEach(
      (
        card,
        index,
      ) => {
        const row =
          Math.floor(
            index /
            2,
          );

        const column =
          index %
          2;

        const x =
          44 +
          column *
          (
            cardWidth +
            14
          );

        const y =
          195 +
          row *
          86;

        doc
          .roundedRect(
            x,
            y,
            cardWidth,
            68,
            10,
          )
          .fillAndStroke(
            colors.light,
            colors.border,
          );

        doc
          .fillColor(
            colors.muted,
          )
          .font(
            'Helvetica',
          )
          .fontSize(
            9,
          )
          .text(
            card.label,
            x +
            14,
            y +
            14,
            {
              width:
                cardWidth -
                28,
            },
          );

        doc
          .fillColor(
            colors.dark,
          )
          .font(
            'Helvetica-Bold',
          )
          .fontSize(
            18,
          )
          .text(
            card.value,
            x +
            14,
            y +
            34,
            {
              width:
                cardWidth -
                28,
            },
          );
      },
    );

    let currentY =
      390;

    const sectionTitle =
      (
        title:
          string,
      ) => {
        if (
          currentY >
          720
        ) {
          doc.addPage();

          currentY =
            48;
        }

        doc
          .fillColor(
            colors.primary,
          )
          .font(
            'Helvetica-Bold',
          )
          .fontSize(
            14,
          )
          .text(
            title,
            44,
            currentY,
          );

        currentY +=
          24;
      };

    const row =
      (
        left:
          string,

        right:
          string,

        extra?:
          string,
      ) => {
        if (
          currentY >
          760
        ) {
          doc.addPage();

          currentY =
            48;
        }

        doc
          .fillColor(
            colors.dark,
          )
          .font(
            'Helvetica-Bold',
          )
          .fontSize(
            9.5,
          )
          .text(
            left,
            44,
            currentY,
            {
              width:
                235,
            },
          );

        doc
          .font(
            'Helvetica',
          )
          .fillColor(
            colors.muted,
          )
          .text(
            right,
            294,
            currentY,
            {
              width:
                255,
              align:
                'right',
            },
          );

        if (extra) {
          doc
            .fontSize(
              8.5,
            )
            .text(
              extra,
              44,
              currentY +
              15,
              {
                width:
                  505,
              },
            );

          currentY +=
            38;
        } else {
          currentY +=
            25;
        }

        doc
          .moveTo(
            44,
            currentY -
            6,
          )
          .lineTo(
            549,
            currentY -
            6,
          )
          .strokeColor(
            colors.border,
          )
          .lineWidth(
            0.6,
          )
          .stroke();
      };

    sectionTitle(
      'Últimas citas',
    );

    if (
      report.appointments.length ===
      0
    ) {
      row(
        'Sin registros',
        '',
      );
    } else {
      report.appointments
        .slice(
          0,
          12,
        )
        .forEach(
          (
            appointment,
          ) => {
            row(
              appointment.client?.name ??
              'Cliente',

              `${appointment.appointment_date} · ${appointment.start_time}`,

              String(
                appointment.status ??
                '',
              ),
            );
          },
        );
    }

    sectionTitle(
      'Clientes registrados',
    );

    if (
      report.clients.length ===
      0
    ) {
      row(
        'Sin registros',
        '',
      );
    } else {
      report.clients
        .slice(
          0,
          12,
        )
        .forEach(
          (
            client,
          ) => {
            row(
              client.name,

              client.phone,

              client.email ??
              'Sin correo',
            );
          },
        );
    }

    sectionTitle(
      'Facturas emitidas',
    );

    if (
      report.invoices.length ===
      0
    ) {
      row(
        'Sin registros',
        '',
      );
    } else {
      report.invoices
        .slice(
          0,
          12,
        )
        .forEach(
          (
            invoice,
          ) => {
            row(
              invoice.invoice_number,

              money(
                Number(
                  invoice.total ??
                  0,
                ),
              ),

              invoice.client?.name ??
              'Cliente',
            );
          },
        );
    }

    doc.end();
  }
}
