import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CandidatsModule } from './module/candidats/candidats.module';
import { AteliersModule } from './module/ateliers/ateliers.module';
import { ConfigModule } from '@nestjs/config';
import { ScoringModule } from './module/scoring/scoring.module';

@Module({
  imports: [
    PrismaModule,
    CandidatsModule,
    AteliersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScoringModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
