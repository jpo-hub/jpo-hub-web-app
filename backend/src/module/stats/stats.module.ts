import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [StatsController],
  providers: [StatsService],
  imports: [PrismaModule],
})
export class StatsModule {}
