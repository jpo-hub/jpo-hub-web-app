import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CandidatsModule } from './module/candidats/candidats.module';
import { AteliersModule } from './module/ateliers/ateliers.module';
import { ConfigModule } from '@nestjs/config';
import { ScoringModule } from './module/scoring/scoring.module';
import { FilieresModule } from './module/filieres/filieres.module';
import { QuestionsModule } from './module/questions/questions.module';
import { AnswersModule } from './module/answers/answers.module';

@Module({
  imports: [
    PrismaModule,
    CandidatsModule,
    AteliersModule,
    ScoringModule,
    FilieresModule,
    ConfigModule.forRoot({ isGlobal: true }),
    QuestionsModule,
    AnswersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
