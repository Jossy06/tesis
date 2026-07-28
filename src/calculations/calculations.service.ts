import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Client } from '../clients/entities/client.entity';
import { InvoiceDetail } from '../invoice-details/entities/invoice-detail.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { ServiceMaterial } from '../service-materials/entities/service-material.entity';
import { BeautyService } from '../services/entities/service.entity';
import { CreateCalculationDto } from './dto/create-calculation.dto';
import {
  Calculation,
  CalculationItem,
} from './entities/calculation.entity';

@Injectable()
export class CalculationsService {
  constructor(
    @InjectRepository(Calculation)
    private readonly calculationRepository: Repository<Calculation>,

    @InjectRepository(ServiceMaterial)
    private readonly serviceMaterialRepository: Repository<ServiceMaterial>,

    @InjectRepository(BeautyService)
    private readonly serviceRepository: Repository<BeautyService>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createCalculationDto: CreateCalculationDto): Promise<{
    calculation: Calculation;
    invoice: Invoice;
  }> {
    if (!createCalculationDto.services?.length) {
      throw new BadRequestException(
        'Debe seleccionar al menos un servicio',
      );
    }

    const client = await this.clientRepository.findOne({
      where: { id: createCalculationDto.client_id },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const serviceIds = [
      ...new Set(
        createCalculationDto.services.map((item) => item.service_id),
      ),
    ];

    const services = await this.serviceRepository.find({
      where: { id: In(serviceIds) },
    });

    if (services.length !== serviceIds.length) {
      throw new NotFoundException(
        'Uno o más servicios no fueron encontrados',
      );
    }

    const serviceMaterials =
      await this.serviceMaterialRepository.find({
        where: { service_id: In(serviceIds) },
        relations: { material: true },
      });

    const items: CalculationItem[] = services.map((service) => {
      const selectedService = createCalculationDto.services.find(
        (item) => item.service_id === service.id,
      );

      const quantity = Math.max(
        1,
        Number(selectedService?.quantity ?? 1),
      );

      const materials = serviceMaterials.filter(
        (item) => item.service_id === service.id,
      );

      const unitMaterialCost = materials.reduce((sum, item) => {
        const materialQuantity = Number(item.quantity);
        const unitPrice = Number(item.material?.unit_price ?? 0);
        return sum + materialQuantity * unitPrice;
      }, 0);

      const unitPrice = Number(service.base_price);

      return {
        service_id: service.id,
        name: service.name,
        group_name: selectedService?.group_name ?? '',
        quantity,
        unit_price: Number(unitPrice.toFixed(2)),
        subtotal: Number((unitPrice * quantity).toFixed(2)),
        material_cost: Number(
          (unitMaterialCost * quantity).toFixed(2),
        ),
      };
    });

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const materialCost = items.reduce(
      (sum, item) => sum + item.material_cost,
      0,
    );
    const profit = total - materialCost;
    const margin = total > 0 ? (profit / total) * 100 : 0;

    return this.dataSource.transaction(async (manager) => {
      const calculationRepository = manager.getRepository(Calculation);
      const invoiceRepository = manager.getRepository(Invoice);
      const invoiceDetailRepository = manager.getRepository(InvoiceDetail);

      const calculation = calculationRepository.create({
        client_id: createCalculationDto.client_id,
        category_name: createCalculationDto.category_name ?? null,
        category_icon: createCalculationDto.category_icon ?? null,
        items,
        total: Number(total.toFixed(2)),
        material_cost: Number(materialCost.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        margin: Number(margin.toFixed(2)),
        status: 'confirmed',
      });

      const savedCalculation = await calculationRepository.save(
        calculation,
      );

      const invoice = invoiceRepository.create({
        invoice_number: this.generateInvoiceNumber(),
        client_id: createCalculationDto.client_id,
        calculation_id: savedCalculation.id,
        appointment_id: null,
        subtotal: Number(total.toFixed(2)),
        iva: 0,
        discount: 0,
        total: Number(total.toFixed(2)),
        status: 'Pendiente',
      });

      const savedInvoice = await invoiceRepository.save(invoice);

      const details = items.map((item) =>
        invoiceDetailRepository.create({
          invoice_id: savedInvoice.id,
          service_id: item.service_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }),
      );

      await invoiceDetailRepository.save(details);

      return {
        calculation: savedCalculation,
        invoice: savedInvoice,
      };
    });
  }

  async findAll(): Promise<Calculation[]> {
    return this.calculationRepository.find({
      relations: { client: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Calculation> {
    const calculation = await this.calculationRepository.findOne({
      where: { id },
      relations: { client: true },
    });

    if (!calculation) {
      throw new NotFoundException('Cálculo no encontrado');
    }

    return calculation;
  }

  async remove(id: string): Promise<{ message: string }> {
    const calculation = await this.findOne(id);
    await this.calculationRepository.remove(calculation);

    return { message: 'Cálculo eliminado correctamente' };
  }

  private generateInvoiceNumber(): string {
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const time = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
      String(now.getMilliseconds()).padStart(3, '0'),
    ].join('');
    const random = Math.floor(100 + Math.random() * 900);

    return `FAC-${date}-${time}-${random}`;
  }
}
