import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Between,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';

import {
  Client,
} from '../clients/entities/client.entity';

import {
  ServiceCategory,
} from '../service-categories/entities/service-category.entity';

import {
  Appointment,
} from './entities/appointment.entity';

import {
  CreateAppointmentDto,
} from './dto/create-appointment.dto';

import {
  UpdateAppointmentDto,
} from './dto/update-appointment.dto';

import {
  AppointmentQueryDto,
} from './dto/appointment-query.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository:
      Repository<Appointment>,

    @InjectRepository(Client)
    private readonly clientRepository:
      Repository<Client>,

    @InjectRepository(ServiceCategory)
    private readonly categoryRepository:
      Repository<ServiceCategory>,
  ) {}

  async create(
    dto: CreateAppointmentDto,
    userId: string,
  ): Promise<Appointment> {
    await this.validateClient(
      dto.client_id,
    );

    const categories =
      await this.getValidCategories(
        dto.category_ids,
      );

    const appointment =
      this.appointmentRepository.create({
        client_id:
          dto.client_id,

        created_by_user_id:
          userId,

        appointment_date:
          dto.appointment_date,

        start_time:
          this.normalizeTime(
            dto.start_time,
          ),

        end_time:
          null,

        status:
          dto.status,

        notes:
          dto.notes?.trim() ||
          null,

        categories,

        subtotal:
          0,

        discount:
          0,

        total:
          0,
      });

    const saved =
      await this.appointmentRepository.save(
        appointment,
      );

    return this.findOne(
      saved.id,
    );
  }

  async findAll(
    query: AppointmentQueryDto,
  ): Promise<Appointment[]> {
    const where:
      FindOptionsWhere<Appointment> =
      {};

    if (query.date) {
      where.appointment_date =
        query.date;
    } else if (
      query.from &&
      query.to
    ) {
      where.appointment_date =
        Between(
          query.from,
          query.to,
        );
    }

    if (query.status) {
      where.status =
        query.status;
    }

    if (query.client_id) {
      where.client_id =
        query.client_id;
    }

    return this.appointmentRepository.find({
      where,

      relations: {
        client: true,
        categories: true,
        created_by: true,
      },

      order: {
        appointment_date:
          'ASC',

        start_time:
          'ASC',
      },
    });
  }

  async findOne(
    id: string,
  ): Promise<Appointment> {
    const appointment =
      await this.appointmentRepository.findOne({
        where: {
          id,
        },

        relations: {
          client: true,
          categories: true,
          created_by: true,
        },
      });

    if (!appointment) {
      throw new NotFoundException(
        'Cita no encontrada',
      );
    }

    return appointment;
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment =
      await this.findOne(id);

    if (dto.client_id) {
      await this.validateClient(
        dto.client_id,
      );

      appointment.client_id =
        dto.client_id;
    }

    if (dto.category_ids) {
      appointment.categories =
        await this.getValidCategories(
          dto.category_ids,
        );
    }

    if (
      dto.appointment_date
    ) {
      appointment.appointment_date =
        dto.appointment_date;
    }

    if (dto.start_time) {
      appointment.start_time =
        this.normalizeTime(
          dto.start_time,
        );
    }

    if (dto.status) {
      appointment.status =
        dto.status;
    }

    if (
      dto.notes !== undefined
    ) {
      appointment.notes =
        dto.notes.trim() ||
        null;
    }

    await this.appointmentRepository.save(
      appointment,
    );

    return this.findOne(id);
  }

  async remove(
    id: string,
  ): Promise<{
    message: string;
  }> {
    const appointment =
      await this.findOne(id);

    await this.appointmentRepository.remove(
      appointment,
    );

    return {
      message:
        'Cita eliminada correctamente',
    };
  }

  private async validateClient(
    clientId: string,
  ): Promise<void> {
    const exists =
      await this.clientRepository.exists({
        where: {
          id: clientId,
        },
      });

    if (!exists) {
      throw new BadRequestException(
        'El cliente seleccionado no existe',
      );
    }
  }

  private async getValidCategories(
    categoryIds: string[],
  ): Promise<ServiceCategory[]> {
    const uniqueIds = [
      ...new Set(
        categoryIds,
      ),
    ];

    const categories =
      await this.categoryRepository.find({
        where: {
          id:
            In(uniqueIds),
        },
      });

    if (
      categories.length !==
      uniqueIds.length
    ) {
      throw new BadRequestException(
        'Una o más categorías seleccionadas no existen',
      );
    }

    return categories;
  }

  private normalizeTime(
    time: string,
  ): string {
    return time.length === 5
      ? `${time}:00`
      : time;
  }
}
