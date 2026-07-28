import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';

import { Client } from '../clients/entities/client.entity';
import { BeautyService } from '../services/entities/service.entity';
import { Appointment } from './entities/appointment.entity';
import { AppointmentDetail } from './entities/appointment-detail.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(BeautyService)
    private readonly serviceRepository: Repository<BeautyService>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    await this.validateClient(dto.client_id);
    await this.validateServices(dto.details.map((item) => item.service_id));

    const totals = this.calculateTotals(dto.details, dto.discount ?? 0);
    const endTime = dto.end_time ?? this.calculateEndTime(
      dto.start_time,
      totals.durationMinutes,
    );

    this.validateTimeRange(dto.start_time, endTime);

    const appointmentId = await this.dataSource.transaction(
      async (manager) => {
        const appointment = manager.create(Appointment, {
          client_id: dto.client_id,
          appointment_date: dto.appointment_date,
          start_time: this.normalizeTime(dto.start_time),
          end_time: this.normalizeTime(endTime),
          status: dto.status,
          notes: dto.notes?.trim() || null,
          subtotal: totals.subtotal,
          discount: totals.discount,
          total: totals.total,
        });

        const saved = await manager.save(appointment);

        const details = dto.details.map((item) =>
          manager.create(AppointmentDetail, {
            appointment_id: saved.id,
            service_id: item.service_id,
            price: item.price,
            quantity: item.quantity,
            duration_minutes: item.duration_minutes,
          }),
        );

        await manager.save(details);
        return saved.id;
      },
    );

    return this.findOne(appointmentId);
  }

  async findAll(query: AppointmentQueryDto): Promise<Appointment[]> {
    const where: FindOptionsWhere<Appointment> = {};

    if (query.date) {
      where.appointment_date = query.date;
    } else if (query.from && query.to) {
      where.appointment_date = Between(query.from, query.to);
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.client_id) {
      where.client_id = query.client_id;
    }

    return this.appointmentRepository.find({
      where,
      relations: {
        client: true,
        details: { service: true },
      },
      order: {
        appointment_date: 'ASC',
        start_time: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        client: true,
        details: { service: true },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    return appointment;
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const current = await this.findOne(id);
    const clientId = dto.client_id ?? current.client_id;

    await this.validateClient(clientId);

    const details = dto.details ?? current.details.map((item) => ({
      service_id: item.service_id,
      price: Number(item.price),
      quantity: item.quantity,
      duration_minutes: item.duration_minutes,
    }));

    await this.validateServices(details.map((item) => item.service_id));

    const totals = this.calculateTotals(
      details,
      dto.discount ?? Number(current.discount),
    );

    const startTime = dto.start_time ?? current.start_time;
    const endTime = dto.end_time ?? this.calculateEndTime(
      startTime,
      totals.durationMinutes,
    );

    this.validateTimeRange(startTime, endTime);

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Appointment, id, {
        client_id: clientId,
        appointment_date: dto.appointment_date ?? current.appointment_date,
        start_time: this.normalizeTime(startTime),
        end_time: this.normalizeTime(endTime),
        status: dto.status ?? current.status,
        notes:
          dto.notes !== undefined
            ? dto.notes.trim() || null
            : current.notes,
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
      });

      if (dto.details) {
        await manager.delete(AppointmentDetail, {
          appointment_id: id,
        });

        const newDetails = details.map((item) =>
          manager.create(AppointmentDetail, {
            appointment_id: id,
            service_id: item.service_id,
            price: item.price,
            quantity: item.quantity,
            duration_minutes: item.duration_minutes,
          }),
        );

        await manager.save(newDetails);
      }
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);

    return { message: 'Cita eliminada correctamente' };
  }

  private async validateClient(clientId: string): Promise<void> {
    const exists = await this.clientRepository.exists({
      where: { id: clientId },
    });

    if (!exists) {
      throw new BadRequestException(
        'El cliente seleccionado no existe',
      );
    }
  }

  private async validateServices(serviceIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(serviceIds)];
    const found = await this.serviceRepository.count({
      where: { id: In(uniqueIds) },
    });

    if (found !== uniqueIds.length) {
      throw new BadRequestException(
        'Uno o más servicios seleccionados no existen',
      );
    }
  }

  private calculateTotals(
    details: Array<{
      price: number;
      quantity: number;
      duration_minutes: number;
    }>,
    discount: number,
  ) {
    const subtotal = details.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const durationMinutes = details.reduce(
      (sum, item) => sum + item.duration_minutes * item.quantity,
      0,
    );

    const normalizedDiscount = Math.max(0, Number(discount));

    if (normalizedDiscount > subtotal) {
      throw new BadRequestException(
        'El descuento no puede superar el subtotal',
      );
    }

    return {
      subtotal: this.roundMoney(subtotal),
      discount: this.roundMoney(normalizedDiscount),
      total: this.roundMoney(subtotal - normalizedDiscount),
      durationMinutes,
    };
  }

  private calculateEndTime(
    startTime: string,
    durationMinutes: number,
  ): string {
    const [hours, minutes] = this.normalizeTime(startTime)
      .split(':')
      .map(Number);

    const totalMinutes = hours * 60 + minutes + durationMinutes;

    if (totalMinutes >= 24 * 60) {
      throw new BadRequestException(
        'La cita no puede finalizar al día siguiente',
      );
    }

    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return `${String(endHours).padStart(2, '0')}:${String(
      endMinutes,
    ).padStart(2, '0')}:00`;
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    if (this.timeToMinutes(endTime) <= this.timeToMinutes(startTime)) {
      throw new BadRequestException(
        'La hora de finalización debe ser posterior a la hora de inicio',
      );
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = this.normalizeTime(time)
      .split(':')
      .map(Number);

    return hours * 60 + minutes;
  }

  private normalizeTime(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
