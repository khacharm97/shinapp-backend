import { Module } from '@nestjs/common';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';
import { PrismaModule } from './prisma/prisma.module';

import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATIONS_HOST || 'localhost',
          port: 3004,
        },
      },
    ]),
  ],
  controllers: [MastersController],
  providers: [MastersService],
})
export class MastersModule {}
