import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export const roundsOfHashing = 10;

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    createAdminDto.password = await bcrypt.hash(
      createAdminDto.password,
      roundsOfHashing,
    );

    return this.prisma.admin.create({
      data: createAdminDto,
    });
  }

  findAll() {
    return this.prisma.admin.findMany();
  }

  findOne(uid: string) {
    return this.prisma.admin.findUnique({ where: { uid } });
  }

  async update(uid: string, updateAdminDto: UpdateAdminDto) {
    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(
        updateAdminDto.password,
        roundsOfHashing,
      );
    }
    return this.prisma.admin.update({
      where: { uid },
      data: updateAdminDto,
    });
  }

  remove(uid: string) {
    return this.prisma.admin.delete({ where: { uid } });
  }
}
