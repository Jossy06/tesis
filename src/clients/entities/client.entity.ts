import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

@Entity('clients')
export class Client {
  @ApiProperty({
    example: '6908e5d7-0bd7-4b96-a0a3-4eee7af14523',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'María Pérez',
  })
  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @ApiProperty({
    example: '0999999999',
  })
  @Column({
    type: 'varchar',
    length: 15,
  })
  phone: string;

  @ApiProperty({
    example: 'maria@gmail.com',
    nullable: true,
  })
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    example: 'Quito Norte',
    nullable: true,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  address: string | null;

  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamp',
  })
  created_at: Date;
}