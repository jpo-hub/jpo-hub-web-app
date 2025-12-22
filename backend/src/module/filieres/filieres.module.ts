import { Module } from '@nestjs/common';
import { FilieresService } from './filieres.service';
import { FilieresController } from './filieres.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FilieresController],
  providers: [FilieresService],
})
export class FilieresModule {}
