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

async function bootstrap(): Promise<void> {
  const app =
    await NestFactory.create(
      AppModule,
    );

  app.enableCors({
    origin: (
      origin,
      callback,
    ) => {
      const allowedOrigins = [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
        'http://192.168.100.47:4200',
      ];

      /*
       * Permite solicitudes sin origin,
       * como Swagger, Postman y aplicaciones móviles.
       */
      if (
        !origin ||
        allowedOrigins.includes(
          origin,
        )
      ) {
        callback(
          null,
          true,
        );

        return;
      }

      callback(
        new Error(
          `Origen no permitido por CORS: ${origin}`,
        ),
        false,
      );
    },

    credentials: true,

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
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig =
    new DocumentBuilder()
      .setTitle(
        "Kathy's Spa API",
      )
      .setDescription(
        'API del sistema de control de costos y ganancias',
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
    'Backend local: http://localhost:3000',
  );

  console.log(
    'Backend en red: http://192.168.100.47:3000',
  );

  console.log(
    'Swagger: http://192.168.100.47:3000/api',
  );
}

void bootstrap();