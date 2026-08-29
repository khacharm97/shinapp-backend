import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsClientModule } from '../notifications/notifications-client.module';

@Module({
  imports: [PrismaModule, NotificationsClientModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
