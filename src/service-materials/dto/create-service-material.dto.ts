import {
  IsNotEmpty,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateServiceMaterialDto {
  @IsString()
  @IsNotEmpty()
  service_id: string;

  @IsString()
  @IsNotEmpty()
  material_id: string;

  @IsNumber()
  quantity: number;
}