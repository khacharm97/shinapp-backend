import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Serve uploads directory
  const express = require('express');
  const { join } = require('path');
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
