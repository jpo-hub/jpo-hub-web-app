import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { ERROR } from '../../common/constants/error.constants';

export const roundsOfHashing = 10;

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    try {
      createAdminDto.password = await bcrypt.hash(
        createAdminDto.password,
        roundsOfHashing,
      );

      return await this.prisma.admin.create({
        data: createAdminDto,
        omit: { password: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          case 'P2002':
            throw new ConflictException(ERROR.AlreadyExists);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  async findAll() {
    try {
      return await this.prisma.admin.findMany({ omit: { password: true } });
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

  async findOne(uid: string) {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { uid },
        omit: { password: true },
      });

      if (!admin) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      return admin;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

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

  async update(uid: string, updateAdminDto: UpdateAdminDto) {
    try {
      if (updateAdminDto.password) {
        updateAdminDto.password = await bcrypt.hash(
          updateAdminDto.password,
          roundsOfHashing,
        );
      }
      return await this.prisma.admin.update({
        where: { uid },
        data: updateAdminDto,
        omit: { password: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          case 'P2002':
            throw new ConflictException(ERROR.AlreadyExists);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  async remove(uid: string) {
    try {
      return await this.prisma.admin.delete({
        where: { uid },
        omit: { password: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          case 'P2002':
            throw new ConflictException(ERROR.AlreadyExists);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }
}
