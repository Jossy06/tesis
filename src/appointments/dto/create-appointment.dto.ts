import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AppointmentStatus } from '../enums/appointment-status.enum';
import { CreateAppointmentDetailDto } from './create-appointment-detail.dto';

export class CreateAppointmentDto {
  @IsUUID()
  client_id: string;

  @IsDateString()
  appointment_date: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'start_time debe tener formato HH:mm o HH:mm:ss',
  })
  start_time: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'end_time debe tener formato HH:mm o HH:mm:ss',
  })
  end_time?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discount?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAppointmentDetailDto)
  details: CreateAppointmentDetailDto[];
}
