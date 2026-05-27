import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CandidatsModule } from './module/candidats/candidats.module';
import { AteliersModule } from './module/ateliers/ateliers.module';
import { ConfigModule } from '@nestjs/config';
import { ScoringModule } from './module/scoring/scoring.module';
import { FilieresModule } from './module/filieres/filieres.module';
import { QuestionsModule } from './module/questions/questions.module';
import { AnswersModule } from './module/answers/answers.module';
import { AdminsModule } from './module/admins/admins.module';
import { AuthModule } from './module/auth/auth.module';
import { StatsModule } from './module/stats/stats.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminsModule,
    CandidatsModule,
    AteliersModule,
    ScoringModule,
    FilieresModule,
    QuestionsModule,
    AnswersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    StatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
