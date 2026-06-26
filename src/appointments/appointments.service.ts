import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment } from './entities/appointment.entity';
import { Client } from '../clients/entities/client.entity';
import { BeautyService } from '../services/entities/service.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(BeautyService)
    private readonly serviceRepository: Repository<BeautyService>,
  ) {}

  async create(body: any) {
    const client = await this.clientRepository.findOne({
      where: {
        id: body.client_id,
      },
    });

    if (!client) {
      throw new BadRequestException(
        'Cliente no encontrado',
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

    const appointment = this.appointmentRepository.create({
      client_id: body.client_id,
      service_id: body.service_id,
      appointment_date: body.appointment_date,
      status: body.status,
      final_price: Number(body.final_price),
      notes: body.notes,
    });

    return await this.appointmentRepository.save(
      appointment,
    );
  }

  async findAll() {
    return await this.appointmentRepository.find({
      relations: {
        client: true,
        service: true,
      },
    });
  }

  async findOne(id: string) {
    const appointment =
      await this.appointmentRepository.findOne({
        where: { id },
        relations: {
          client: true,
          service: true,
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
    body: any,
  ) {
    const appointment =
      await this.findOne(id);

    Object.assign(
      appointment,
      body,
    );

    return await this.appointmentRepository.save(
      appointment,
    );
  }

  async remove(id: string) {
    const appointment =
      await this.findOne(id);

    await this.appointmentRepository.remove(
      appointment,
    );

    return {
      message: 'Cita eliminada correctamente',
    };
  }
}