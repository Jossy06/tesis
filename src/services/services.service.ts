import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BeautyService } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(BeautyService)
    private readonly serviceRepository: Repository<BeautyService>,
  ) {}

  async create(createServiceDto: any) {
    const service =
      this.serviceRepository.create(createServiceDto);

    return await this.serviceRepository.save(service);
  }

  async findAll() {
    return await this.serviceRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const service =
      await this.serviceRepository.findOne({
        where: { id },
      });

    if (!service) {
      throw new NotFoundException(
        'Servicio no encontrado',
      );
    }

    return service;
  }

  async update(id: string, updateDto: any) {
    const service = await this.findOne(id);

    Object.assign(service, updateDto);

    return await this.serviceRepository.save(service);
  }

  async remove(id: string) {
    const service = await this.findOne(id);

    await this.serviceRepository.remove(service);

    return {
      message: 'Servicio eliminado correctamente',
    };
  }
}