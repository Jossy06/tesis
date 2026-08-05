import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import { UsersService } from '../../users/users.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy
  extends PassportStrategy(
    Strategy,
  )
{
  constructor(
    configService:
      ConfigService,

    private readonly usersService:
      UsersService,
  ) {
    const jwtSecret =
      configService.get<string>(
        'JWT_SECRET',
      );

    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET no está definido en el archivo .env',
      );
    }

    super({
      jwtFromRequest:
        ExtractJwt
          .fromAuthHeaderAsBearerToken(),

      ignoreExpiration:
        false,

      secretOrKey:
        jwtSecret,
    });
  }

  async validate(
    payload: JwtPayload,
  ) {
    const user =
      await this.usersService
        .findOneEntity(
          payload.sub,
        );

    if (!user.is_active) {
      throw new UnauthorizedException(
        'El usuario está desactivado',
      );
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}