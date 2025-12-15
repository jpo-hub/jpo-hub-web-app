import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CandidatsModule } from './module/candidats/candidats.module';
import { AteliersModule } from './module/ateliers/ateliers.module';

@Module({
  imports: [PrismaModule, CandidatsModule, AteliersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
