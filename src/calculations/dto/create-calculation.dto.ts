import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateCalculationServiceDto {
  @IsUUID()
  service_id: string;

  @IsOptional()
  @IsString()
  group_name?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateCalculationDto {
  @IsUUID()
  client_id: string;

  @IsOptional()
  @IsString()
  category_name?: string;

  @IsOptional()
  @IsString()
  category_icon?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCalculationServiceDto)
  services: CreateCalculationServiceDto[];
}
