import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Josselyn Mena',
    description: 'Nombre completo del usuario',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'admin@beautycost.com',
    description: 'Correo electrónico',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin123*',
    description: 'Contraseña (mínimo 6 caracteres)',
    minLength: 6,
  })
  @MinLength(6)
  password: string;
}