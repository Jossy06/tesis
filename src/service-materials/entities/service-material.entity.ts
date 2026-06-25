import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BeautyService } from '../../services/entities/service.entity';
import { Material } from '../../materials/entities/material.entity';

@Entity('service_materials')
export class ServiceMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  service_id: string;

  @Column('uuid')
  material_id: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantity: number;

  @ManyToOne(
    () => BeautyService,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'service_id',
  })
  service: BeautyService;

  @ManyToOne(
    () => Material,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'material_id',
  })
  material: Material;
}