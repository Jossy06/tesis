import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Client } from '../../clients/entities/client.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoice_number: string;

  @Column('uuid')
  client_id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column('uuid', { nullable: true })
  appointment_id: string;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  subtotal: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  iva: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  discount: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  total: number;

  @Column({
    default: 'Pendiente',
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}