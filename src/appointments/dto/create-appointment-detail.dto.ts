import {
  IsInt,
  IsNumber,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDetailDto {
  @IsUUID()
  service_id: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration_minutes: number;
}
