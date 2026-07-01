import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Invoice } from '../../invoices/entities/invoice.entity';
import { BeautyService } from '../../services/entities/service.entity';

@Entity('invoice_details')
export class InvoiceDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  invoice_id: string;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column('uuid')
  service_id: string;

  @ManyToOne(() => BeautyService)
  @JoinColumn({ name: 'service_id' })
  service: BeautyService;

  @Column('int')
  quantity: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  unit_price: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  subtotal: number;
}