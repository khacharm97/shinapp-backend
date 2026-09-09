import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MastersModule } from './masters/masters.module';
import { SkillsModule } from './skills/skills.module';
import { BrigadesModule } from './brigades/brigades.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TechniquesModule } from './techniques/techniques.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MastersModule,
    SkillsModule,
    BrigadesModule,
    AnnouncementsModule,
    OrdersModule,
    ReviewsModule,
    TechniquesModule,
  ],
})
export class AppModule {}
