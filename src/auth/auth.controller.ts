import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado correctamente',
  })
  @ApiResponse({
    status: 409,
    description: 'El correo ya está registrado',
  })
  register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(
      registerDto,
    );
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
  })
  @ApiResponse({
    status: 201,
    description: 'Login correcto, devuelve token JWT',
  })
  @ApiResponse({
    status: 401,
    description: 'Correo o contraseña incorrectos',
  })
  login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(
      loginDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado obtenido correctamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o no enviado',
  })
  me(@Req() req: any) {
    return req.user;
  }
}