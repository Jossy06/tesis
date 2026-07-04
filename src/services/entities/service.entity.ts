import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ServiceCategory } from '../../service-categories/entities/service-category.entity';
import { ServiceGroup } from '../../service-groups/entities/service-group.entity';

@Entity('services')
export class BeautyService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  base_price: number;

  // ==========================
  // CATEGORÍA
  // ==========================

  @Column({
    type: 'uuid',
    nullable: true,
  })
  category_id: string;

  @ManyToOne(
    () => ServiceCategory,
    (category) => category.services,
    { nullable: true },
  )
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  // ==========================
  // GRUPO
  // ==========================

  @Column({
    type: 'uuid',
    nullable: true,
  })
  group_id: string;

  @ManyToOne(
    () => ServiceGroup,
    (group) => group.services,
    { nullable: true },
  )
  @JoinColumn({ name: 'group_id' })
  group: ServiceGroup;

  @CreateDateColumn()
  created_at: Date;
}