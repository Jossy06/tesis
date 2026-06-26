import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @IsUUID()
  @IsNotEmpty()
  service_id: string;

  @IsDateString()
  appointment_date: Date;

  @IsOptional()
  @IsString()
  status?: string;

  @IsNumber()
  final_price: number;

  @IsOptional()
  @IsString()
  notes?: string;
}