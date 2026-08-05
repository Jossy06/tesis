import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Calculation } from '../../calculations/entities/calculation.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoice_number: string;

  @Column('uuid')
  client_id: string;

  @ManyToOne(() => Client, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  created_by_user_id: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'created_by_user_id',
  })
  created_by: User | null;

  @Column('uuid', {
    nullable: true,
    unique: true,
  })
  calculation_id: string | null;

  @OneToOne(() => Calculation, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'calculation_id' })
  calculation: Calculation | null;

  @Column('uuid', {
    nullable: true,
  })
  appointment_id: string | null;

  @ManyToOne(() => Appointment, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment | null;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  subtotal: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
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
