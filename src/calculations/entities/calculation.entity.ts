import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Client } from '../../clients/entities/client.entity';

export interface CalculationItem {
  service_id: string;
  name: string;
  group_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  material_cost: number;
}

@Entity('calculations')
export class Calculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', {
  nullable: true,
})
client_id: string | null;

  @ManyToOne(() => Client, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'varchar', length: 120, nullable: true })
  category_name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category_icon: string | null;

  @Column({ type: 'jsonb' })
  items: CalculationItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  material_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  profit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  margin: number;

  @Column({ type: 'varchar', length: 30, default: 'confirmed' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
