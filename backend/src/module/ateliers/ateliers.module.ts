import { Module } from '@nestjs/common';
import { AteliersService } from './ateliers.service';
import { AteliersController } from './ateliers.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AteliersController],
  providers: [AteliersService],
})
export class AteliersModule {}
