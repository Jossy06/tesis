import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { BeautyService } from '../../services/entities/service.entity';
import { ServiceGroup } from '../../service-groups/entities/service-group.entity';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ length: 30, nullable: true })
  color: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(
    () => BeautyService,
    (service) => service.category,
  )
  services: BeautyService[];

  @OneToMany(
    () => ServiceGroup,
    (group) => group.category,
  )
  groups: ServiceGroup[];
}