import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [AdminsController],
  providers: [AdminsService],
  imports: [PrismaModule],
  exports: [AdminsService],
})
export class AdminsModule {}
