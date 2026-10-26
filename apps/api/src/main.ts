//backendi başlatır ve başlangıç ayarlarını yapar
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { configureApp } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);  //nestjs uygulamasını oluşturur

  configureApp(app);   //ortak api ayarlarını uygular

  const config = new DocumentBuilder()   //swagger dokümantasyonunu hazırlar
    .setTitle('RentACar API')
    .setDescription('RentACar platformunun REST API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);  //swaggerı erişilebilir hale getirir

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);    //sunucuyu başlatır
}

void bootstrap();