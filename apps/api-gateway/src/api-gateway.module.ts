import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './common/strategies/google.strategy';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_HOST || 'localhost',
          port: 3001,
        },
      },
      {
        name: 'MASTERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MASTERS_HOST || 'localhost',
          port: 3002,
        },
      },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService, JwtStrategy, GoogleStrategy],
})
export class ApiGatewayModule {}
