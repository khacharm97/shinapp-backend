import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsClientModule } from '../notifications/notifications-client.module';

@Module({
  imports: [PrismaModule, NotificationsClientModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
