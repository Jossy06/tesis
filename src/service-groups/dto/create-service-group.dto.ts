import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateServiceGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  sort?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsUUID()
  @IsNotEmpty()
  category_id: string;
}