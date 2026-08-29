import { Module } from '@nestjs/common';
import { BrigadesController } from './brigades.controller';
import { BrigadesService } from './brigades.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsClientModule } from '../notifications/notifications-client.module';

@Module({
  imports: [PrismaModule, NotificationsClientModule],
  controllers: [BrigadesController],
  providers: [BrigadesService],
})
export class BrigadesModule {}
