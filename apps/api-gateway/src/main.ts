import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.enableCors(); // Allow frontend to talk to API Gateway
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
