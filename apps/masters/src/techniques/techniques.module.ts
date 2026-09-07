import { Module } from '@nestjs/common';
import { TechniquesController } from './techniques.controller';
import { TechniquesService } from './techniques.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TechniquesController],
  providers: [TechniquesService],
})
export class TechniquesModule {}
