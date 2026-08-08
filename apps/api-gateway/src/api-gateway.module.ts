import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './common/strategies/google.strategy';
import { AdminAuthController } from './admin/controllers/admin-auth.controller';
import { AdminUsersController } from './admin/controllers/admin-users.controller';
import { AdminSkillsController } from './admin/controllers/admin-skills.controller';
import { AdminAnnouncementsController } from './admin/controllers/admin-announcements.controller';
import { AdminContactRequestsController } from './admin/controllers/admin-contact-requests.controller';
import { ContactRequestsController } from './contact-requests.controller';
import { NotificationsGateway } from './notifications.gateway';
import { R2StorageService } from './r2-storage.service';

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
      {
        name: 'ADMIN_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ADMIN_HOST || 'localhost',
          port: 3003,
        },
      },
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATIONS_HOST || 'localhost',
          port: 3004,
        },
      },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [
    ApiGatewayController,
    AdminAuthController,
    AdminUsersController,
    AdminSkillsController,
    AdminAnnouncementsController,
    AdminContactRequestsController,
    ContactRequestsController,
  ],
  providers: [
    ApiGatewayService, 
    JwtStrategy, 
    GoogleStrategy,
    NotificationsGateway,
    R2StorageService,
  ],
})
export class ApiGatewayModule {}
