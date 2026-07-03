import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

 async register(registerDto: RegisterDto) {
  const existingUser =
    await this.usersService.findByEmail(
      registerDto.email,
    );

  if (existingUser) {
    throw new ConflictException(
      'El correo ya está registrado',
    );
  }

  const user =
    await this.usersService.create(registerDto);

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    message: 'Usuario registrado correctamente',
    access_token:
      await this.jwtService.signAsync(payload),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
  async login(loginDto: LoginDto) {
  console.log('========== LOGIN ==========');
  console.log('Email recibido:', loginDto.email);
  console.log('Password recibida:', loginDto.password);

  const user = await this.usersService.findByEmail(
    loginDto.email,
  );

  console.log('Usuario encontrado:', user);

  if (!user) {
    console.log('NO EXISTE EL USUARIO');
    throw new UnauthorizedException(
      'Correo o contraseña incorrectos',
    );
  }

  console.log('Password guardada:', user.password);

  const passwordMatch = await bcrypt.compare(
    loginDto.password,
    user.password,
  );

  console.log('Coinciden:', passwordMatch);

  if (!passwordMatch) {
    console.log('PASSWORD INCORRECTA');
    throw new UnauthorizedException(
      'Correo o contraseña incorrectos',
    );
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    access_token: await this.jwtService.signAsync(payload),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
}