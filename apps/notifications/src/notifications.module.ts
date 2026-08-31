import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from './prisma/prisma.module';
import { UnreadMessagesModule } from './unread-messages/unread-messages.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    UnreadMessagesModule,
    ClientsModule.register([
      {
        name: 'API_GATEWAY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.API_GATEWAY_HOST || 'localhost',
          port: 3005,
        },
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
