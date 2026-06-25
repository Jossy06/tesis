import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceMaterial } from './entities/service-material.entity';
import { BeautyService } from '../services/entities/service.entity';
import { Material } from '../materials/entities/material.entity';

@Injectable()
export class ServiceMaterialsService {
  constructor(
    @InjectRepository(ServiceMaterial)
    private readonly serviceMaterialRepository: Repository<ServiceMaterial>,

    @InjectRepository(BeautyService)
    private readonly serviceRepository: Repository<BeautyService>,

    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async create(body: any) {
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

    const material = await this.materialRepository.findOne({
      where: {
        id: body.material_id,
      },
    });

    if (!material) {
      throw new BadRequestException(
        'Material no encontrado',
      );
    }

    const serviceMaterial =
      this.serviceMaterialRepository.create({
        service_id: body.service_id,
        material_id: body.material_id,
        quantity: Number(body.quantity),
      });

    return await this.serviceMaterialRepository.save(
      serviceMaterial,
    );
  }

  async findAll() {
    return await this.serviceMaterialRepository.find({
      relations: {
        service: true,
        material: true,
      },
    });
  }

  async findOne(id: string) {
    const serviceMaterial =
      await this.serviceMaterialRepository.findOne({
        where: { id },
        relations: {
          service: true,
          material: true,
        },
      });

    if (!serviceMaterial) {
      throw new NotFoundException(
        'Registro no encontrado',
      );
    }

    return serviceMaterial;
  }

  async update(
    id: string,
    body: any,
  ) {
    const serviceMaterial =
      await this.findOne(id);

    Object.assign(
      serviceMaterial,
      body,
    );

    return await this.serviceMaterialRepository.save(
      serviceMaterial,
    );
  }

  async remove(id: string) {
    const serviceMaterial =
      await this.findOne(id);

    await this.serviceMaterialRepository.remove(
      serviceMaterial,
    );

    return {
      message:
        'Material eliminado del servicio',
    };
  }
}