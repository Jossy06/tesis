import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  QueryFailedError,
  Repository,
} from 'typeorm';

import {
  ServiceCategory,
} from './entities/service-category.entity';

import {
  CreateServiceCategoryDto,
} from './dto/create-service-category.dto';

import {
  UpdateServiceCategoryDto,
} from './dto/update-service-category.dto';

interface PostgreSqlError {
  code?: string;
  detail?: string;
  constraint?: string;
}

@Injectable()
export class ServiceCategoriesService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository:
      Repository<ServiceCategory>,
  ) {}

  async create(
    createServiceCategoryDto:
      CreateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    const category =
      this.categoryRepository.create(
        createServiceCategoryDto,
      );

    return this.categoryRepository.save(
      category,
    );
  }

  async findAll():
    Promise<ServiceCategory[]> {
    return this.categoryRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<ServiceCategory> {
    const category =
      await this.categoryRepository.findOne({
        where: {
          id,
        },
      });

    if (!category) {
      throw new NotFoundException(
        'Categoría de servicio no encontrada.',
      );
    }

    return category;
  }

  async update(
    id: string,
    updateServiceCategoryDto:
      UpdateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    const category =
      await this.findOne(id);

    Object.assign(
      category,
      updateServiceCategoryDto,
    );

    return this.categoryRepository.save(
      category,
    );
  }

  async remove(
    id: string,
  ): Promise<{
    message: string;
  }> {
    const category =
      await this.findOne(id);

    try {
      await this.categoryRepository.remove(
        category,
      );

      return {
        message:
          'Categoría eliminada correctamente.',
      };
    } catch (error: unknown) {
      if (
        error instanceof
        QueryFailedError
      ) {
        const databaseError =
          error.driverError as
            PostgreSqlError;

        if (
          databaseError.code === '23503' ||
          databaseError.code === '23001'
        ) {
          throw new ConflictException(
            'La categoría posee grupos, servicios o citas relacionadas. Elimina primero esos registros.',
          );
        }
      }

      throw error;
    }
  }
}