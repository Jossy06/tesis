import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvoiceDetail } from './entities/invoice-detail.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { BeautyService } from '../services/entities/service.entity';

@Injectable()
export class InvoiceDetailsService {
  constructor(
    @InjectRepository(InvoiceDetail)
    private readonly invoiceDetailRepository: Repository<InvoiceDetail>,

    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(BeautyService)
    private readonly serviceRepository: Repository<BeautyService>,
  ) {}

  async create(body: any) {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: body.invoice_id,
      },
    });

    if (!invoice) {
      throw new BadRequestException(
        'Factura no encontrada',
      );
    }

    const service = await this.serviceRepository.findOne({
      where: {
        id: body.service_id,
      },
    });

    if (!service) {
      throw new BadRequestException(
        'Servicio no encontrado',
      );
    }

    const quantity = Number(body.quantity);

    const unit_price = Number(service.base_price);

    const subtotal = Number(
      (quantity * unit_price).toFixed(2),
    );

    const invoiceDetail =
      this.invoiceDetailRepository.create({
        invoice_id: invoice.id,
        service_id: service.id,
        quantity,
        unit_price,
        subtotal,
      });

    return await this.invoiceDetailRepository.save(
      invoiceDetail,
    );
  }

  async findAll() {
    return await this.invoiceDetailRepository.find({
      relations: {
        invoice: true,
        service: true,
      },
    });
  }

  async findOne(id: string) {
    const invoiceDetail =
      await this.invoiceDetailRepository.findOne({
        where: { id },
        relations: {
          invoice: true,
          service: true,
        },
      });

    if (!invoiceDetail) {
      throw new NotFoundException(
        'Detalle de factura no encontrado',
      );
    }

    return invoiceDetail;
  }

  async update(
    id: string,
    body: any,
  ) {
    const invoiceDetail =
      await this.findOne(id);

    Object.assign(invoiceDetail, body);

    return await this.invoiceDetailRepository.save(
      invoiceDetail,
    );
  }

  async remove(id: string) {
    const invoiceDetail =
      await this.findOne(id);

    await this.invoiceDetailRepository.remove(
      invoiceDetail,
    );

    return {
      message:
        'Detalle de factura eliminado correctamente',
    };
  }
}