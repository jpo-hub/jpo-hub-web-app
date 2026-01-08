import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200', // ton frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true, // si besoin d’envoyer des cookies
  });

  const config = new DocumentBuilder()
    .setTitle('API JPO-HUB')
    .setDescription('The JPO-HUB API description')
    .setVersion('0.1')
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'delete'],
    },
  });

  await app.listen(3000);
}
bootstrap();