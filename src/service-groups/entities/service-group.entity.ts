import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { ServiceCategory } from '../../service-categories/entities/service-category.entity';
import { BeautyService } from '../../services/entities/service.entity';

@Entity('service_groups')
export class ServiceGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ default: 1 })
  sort: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'uuid' })
  category_id: string;

  @ManyToOne(
    () => ServiceCategory,
    (category) => category.groups,
  )
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @OneToMany(
    () => BeautyService,
    (service) => service.group,
  )
  services: BeautyService[];

  @CreateDateColumn()
  created_at: Date;
}