import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  business_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  ruc: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  iva_percentage: number;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  terms_conditions?: string | null;
}