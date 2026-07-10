import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  In,
  Repository,
} from 'typeorm';

import {
  Calculation,
  CalculationItem,
} from './entities/calculation.entity';

import { CreateCalculationDto } from './dto/create-calculation.dto';

import { ServiceMaterial } from '../service-materials/entities/service-material.entity';
import { BeautyService } from '../services/entities/service.entity';

@Injectable()
export class CalculationsService {
  constructor(
    @InjectRepository(Calculation)
    private readonly calculationRepository: Repository<Calculation>,

    @InjectRepository(ServiceMaterial)
    private readonly serviceMaterialRepository: Repository<ServiceMaterial>,

    @InjectRepository(BeautyService)
    private readonly serviceRepository: Repository<BeautyService>,
  ) {}

  async create(
    createCalculationDto: CreateCalculationDto,
  ): Promise<Calculation> {
    if (
      !createCalculationDto.services ||
      createCalculationDto.services.length === 0
    ) {
      throw new BadRequestException(
        'Debe seleccionar al menos un servicio',
      );
    }

    const serviceIds = [
      ...new Set(
        createCalculationDto.services.map(
          (item) => item.service_id,
        ),
      ),
    ];

    const services =
      await this.serviceRepository.find({
        where: {
          id: In(serviceIds),
        },
      });

    if (services.length !== serviceIds.length) {
      throw new NotFoundException(
        'Uno o más servicios no fueron encontrados',
      );
    }

    const serviceMaterials =
      await this.serviceMaterialRepository.find({
        where: {
          service_id: In(serviceIds),
        },
        relations: {
          material: true,
        },
      });

    const items: CalculationItem[] =
      services.map((service) => {
        const selectedService =
          createCalculationDto.services.find(
            (item) =>
              item.service_id === service.id,
          );

        const materials =
          serviceMaterials.filter(
            (item) =>
              item.service_id === service.id,
          );

        const materialCost = materials.reduce(
          (sum, item) => {
            const quantity = Number(
              item.quantity,
            );

            const unitPrice = Number(
              item.material?.unit_price ?? 0,
            );

            return (
              sum +
              quantity * unitPrice
            );
          },
          0,
        );

        return {
          service_id: service.id,
          name: service.name,
          group_name:
            selectedService?.group_name ??
            '',
          price: Number(
            Number(
              service.base_price,
            ).toFixed(2),
          ),
          material_cost: Number(
            materialCost.toFixed(2),
          ),
        };
      });

    const total = items.reduce(
      (sum, item) =>
        sum + item.price,
      0,
    );

    const materialCost = items.reduce(
      (sum, item) =>
        sum + item.material_cost,
      0,
    );

    const profit =
      total - materialCost;

    const margin =
      total > 0
        ? (profit / total) * 100
        : 0;

    const calculation =
      this.calculationRepository.create({
        category_name:
          createCalculationDto.category_name ??
          null,

        category_icon:
          createCalculationDto.category_icon ??
          null,

        items,

        total: Number(
          total.toFixed(2),
        ),

        material_cost: Number(
          materialCost.toFixed(2),
        ),

        profit: Number(
          profit.toFixed(2),
        ),

        margin: Number(
          margin.toFixed(2),
        ),

        status: 'confirmed',
      });

    return await this.calculationRepository.save(
      calculation,
    );
  }

  async findAll(): Promise<Calculation[]> {
    return await this.calculationRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<Calculation> {
    const calculation =
      await this.calculationRepository.findOne({
        where: { id },
      });

    if (!calculation) {
      throw new NotFoundException(
        'Cálculo no encontrado',
      );
    }

    return calculation;
  }

  async remove(
    id: string,
  ): Promise<{ message: string }> {
    const calculation =
      await this.findOne(id);

    await this.calculationRepository.remove(
      calculation,
    );

    return {
      message:
        'Cálculo eliminado correctamente',
    };
  }
}