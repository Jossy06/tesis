import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Client } from '../../clients/entities/client.entity';
import { BeautyService } from '../../services/entities/service.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  client_id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column('uuid')
  service_id: string;

  @ManyToOne(() => BeautyService)
  @JoinColumn({ name: 'service_id' })
  service: BeautyService;

  @Column({
    type: 'timestamp',
  })
  appointment_date: Date;

  @Column({
    default: 'Pendiente',
  })
  status: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  final_price: number;

  @Column({
    nullable: true,
  })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}