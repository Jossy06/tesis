import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  unit_price: number;

  @IsNumber()
  stock: number;

  @IsString()
  @IsNotEmpty()
  unit: string;
}