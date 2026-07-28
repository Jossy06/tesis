import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceCategory } from './entities/service-category.entity';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository:
      Repository<ServiceCategory>,
  ) {}

  async create(
    createServiceCategoryDto: CreateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    const category = this.categoryRepository.create(
      createServiceCategoryDto,
    );

    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<ServiceCategory[]> {
    console.log('✅ Cargando categorías desde PostgreSQL');

    return await this.categoryRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<ServiceCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        'Categoría de servicio no encontrada',
      );
    }

    return category;
  }

  async update(
    id: string,
    updateServiceCategoryDto: UpdateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    const category = await this.findOne(id);

    Object.assign(
      category,
      updateServiceCategoryDto,
    );

    return await this.categoryRepository.save(category);
  }

  async remove(
    id: string,
  ): Promise<{ message: string }> {
    const category = await this.findOne(id);

    await this.categoryRepository.remove(category);

    return {
      message: 'Categoría eliminada correctamente',
    };
  }
}