import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CalculationServiceDto {
  @IsUUID()
  @IsNotEmpty()
  service_id: string;

  @IsString()
  @IsOptional()
  group_name?: string;
}

export class CreateCalculationDto {
  @IsString()
  @IsOptional()
  category_name?: string;

  @IsString()
  @IsOptional()
  category_icon?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculationServiceDto)
  services: CalculationServiceDto[];
}