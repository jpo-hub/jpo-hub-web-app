import { Module } from '@nestjs/common';
import { CandidatsService } from './candidats.service';
import { CandidatsController } from './candidats.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CandidatsController],
  providers: [CandidatsService, PrismaService],
  exports: [CandidatsService],
})
export class CandidatsModule {}
