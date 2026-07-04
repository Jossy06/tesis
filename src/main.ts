import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  console.log('========== CONFIG ==========');
  console.log('DB_HOST:', config.get('DB_HOST'));
  console.log('DB_PORT:', config.get('DB_PORT'));
  console.log('DB_DATABASE:', config.get('DB_DATABASE'));
  console.log('============================');

  app.enableCors({
    origin: true,
    credentials: true,
    methods: [
      'GET',
      'HEAD',
      'PUT',
      'PATCH',
      'POST',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Beauty Cost System API')
    .setDescription("API del sistema Katty's Nails")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup(
    'api',
    app,
    document,
  );

  await app.listen(3000);

  console.log(
    '🚀 Backend corriendo en http://localhost:3000',
  );

  console.log(
    '📘 Swagger disponible en http://localhost:3000/api',
  );
}

bootstrap();