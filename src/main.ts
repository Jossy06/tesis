import {
  ValidationPipe,
} from '@nestjs/common';

import {
  NestFactory,
} from '@nestjs/core';

import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import {
  AppModule,
} from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://192.168.100.47:4200',
    ],

    credentials:
      true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
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
      whitelist:
        true,

      transform:
        true,

      forbidNonWhitelisted:
        true,
    }),
  );

  const swaggerConfig =
    new DocumentBuilder()
      .setTitle(
        "Kathy's Nails API",
      )
      .setDescription(
        'API del sistema de costos y gestión del salón',
      )
      .setVersion(
        '1.0',
      )
      .addBearerAuth()
      .build();

  const document =
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'api',
    app,
    document,
  );

  await app.listen(
    3000,
    '0.0.0.0',
  );

  console.log(
    'Backend disponible en:',
  );

  console.log(
    'http://localhost:3000',
  );

  console.log(
    'http://192.168.100.47:3000',
  );

  console.log(
    'Swagger:',
  );

  console.log(
    'http://192.168.100.47:3000/api',
  );
}

void bootstrap();