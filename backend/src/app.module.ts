import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CandidatsModule } from './module/candidats/candidats.module';

@Module({
  imports: [PrismaModule, CandidatsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
