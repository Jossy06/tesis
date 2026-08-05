import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 150,
  })
  business_name: string;

  @Column({
    length: 20,
  })
  ruc: string;

  @Column({
    type: 'text',
  })
  address: string;

  @Column({
    length: 30,
  })
  phone: string;

  @Column({
    length: 150,
  })
  email: string;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    default: 15,
  })
  iva_percentage: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  terms_conditions: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}