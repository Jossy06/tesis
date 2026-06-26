import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    length: 15,
  })
  phone: string;

  @Column({
    unique: true,
    nullable: true,
  })
  email: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  address: string;

  @CreateDateColumn()
  created_at: Date;
}