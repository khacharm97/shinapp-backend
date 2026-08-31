import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { UnreadMessagesEmailService } from './unread-messages-email.service';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [UnreadMessagesEmailService],
})
export class UnreadMessagesModule {}
