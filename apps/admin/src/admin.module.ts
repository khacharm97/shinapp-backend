import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { ContactRequestsModule } from './contact-requests/contact-requests.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SkillsModule,
    AnnouncementsModule,
    ContactRequestsModule,
  ],
})
export class AdminModule {}
