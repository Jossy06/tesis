import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceMaterial } from '../service-materials/entities/service-material.entity';
import { BeautyService } from '../services/entities/service.entity';

@Injectable()
export class CalculationsService {
  constructor(
    @InjectRepository(ServiceMaterial)
    private readonly serviceMaterialRepository: Repository<ServiceMaterial>,

    @InjectRepository(BeautyService)
    private readonly serviceRepository: Repository<BeautyService>,
  ) {}

  async calculate(
    serviceId: string,
    labor: number,
    operational: number,
    desiredProfit: number,
  ) {
    const service = await this.serviceRepository.findOne({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      throw new NotFoundException(
        'Servicio no encontrado',
      );
    }

    const materials =
      await this.serviceMaterialRepository.find({
        where: {
          service_id: serviceId,
        },
        relations: {
          material: true,
        },
      });

    let materialCost = 0;

    for (const item of materials) {
      materialCost +=
        Number(item.quantity) *
        Number(item.material.unit_price);
    }

    const suggestedPrice =
      materialCost +
      Number(labor) +
      Number(operational) +
      Number(desiredProfit);

    return {
      service: service.name,
      materials: Number(
        materialCost.toFixed(2),
      ),
      labor: Number(labor),
      operational: Number(operational),
      profit: Number(desiredProfit),
      suggested_price: Number(
        suggestedPrice.toFixed(2),
      ),
    };
  }
}