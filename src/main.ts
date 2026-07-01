import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Beauty Cost System API')
    .setDescription(
      'API del Sistema de Gestión para Centro de Belleza',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup(
    'api',
    app,
    document,
  );

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 API: http://localhost:${process.env.PORT ?? 3000}`,
  );

  console.log(
    `📚 Swagger: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}

bootstrap();