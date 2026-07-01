import {
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';

export class CreateInvoiceDetailDto {
  @IsUUID()
  invoice_id: string;

  @IsUUID()
  service_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}