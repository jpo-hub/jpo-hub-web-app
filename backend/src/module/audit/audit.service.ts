import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { ERROR } from '../../common/constants/error.constants';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.audit_log.findMany({
        orderBy: { logged_at: 'desc' },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }
}
