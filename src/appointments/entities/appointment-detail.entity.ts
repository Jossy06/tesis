import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Appointment } from './appointment.entity';
import { BeautyService } from '../../services/entities/service.entity';

@Entity('appointment_details')
export class AppointmentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
  })
  appointment_id: string;

  @ManyToOne(
    () => Appointment,
    (appointment) => appointment.details,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'appointment_id',
  })
  appointment: Appointment;

  @Column({
    type: 'uuid',
  })
  service_id: string;

  @ManyToOne(() => BeautyService, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'service_id',
  })
  service: BeautyService;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity: number;

  @Column({
    type: 'int',
    default: 60,
  })
  duration_minutes: number;
}