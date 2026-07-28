import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceGroup } from './entities/service-group.entity';
import { CreateServiceGroupDto } from './dto/create-service-group.dto';
import { UpdateServiceGroupDto } from './dto/update-service-group.dto';

@Injectable()
export class ServiceGroupsService {
  constructor(
    @InjectRepository(ServiceGroup)
    private readonly serviceGroupRepository:
      Repository<ServiceGroup>,
  ) {}

  async create(
    createServiceGroupDto: CreateServiceGroupDto,
  ): Promise<ServiceGroup> {
    const group =
      this.serviceGroupRepository.create(
        createServiceGroupDto,
      );

    return await this.serviceGroupRepository.save(
      group,
    );
  }

  async findAll(): Promise<ServiceGroup[]> {
    return await this.serviceGroupRepository.find({
      relations: {
        category: true,
      },
      order: {
        sort: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<ServiceGroup> {
    const group =
      await this.serviceGroupRepository.findOne({
        where: {
          id,
        },
        relations: {
          category: true,
        },
      });

    if (!group) {
      throw new NotFoundException(
        'Grupo de servicio no encontrado',
      );
    }

    return group;
  }

  async update(
    id: string,
    updateServiceGroupDto:
      UpdateServiceGroupDto,
  ): Promise<ServiceGroup> {
    const group = await this.findOne(id);

    Object.assign(
      group,
      updateServiceGroupDto,
    );

    return await this.serviceGroupRepository.save(
      group,
    );
  }

  async remove(
    id: string,
  ): Promise<{ message: string }> {
    const group = await this.findOne(id);

    await this.serviceGroupRepository.remove(group);

    return {
      message:
        'Grupo de servicio eliminado correctamente',
    };
  }
}