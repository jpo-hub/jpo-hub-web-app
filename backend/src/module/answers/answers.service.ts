import { Injectable } from '@nestjs/common';
import { Prisma, Response } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.ResponseCreateInput): Promise<Response> {
    return this.prisma.response.create({
      data,
    });
  }

  findAll(): Promise<Response[]> {
    return this.prisma.response.findMany();
  }

  findOne(
    reponseWhereUniqueInput: Prisma.ResponseWhereUniqueInput,
  ): Promise<Response | null> {
    return this.prisma.response.findUnique({
      where: reponseWhereUniqueInput,
    });
  }

  async update(
    reponseWhereUniqueInput: Prisma.ResponseWhereUniqueInput,
    data: Prisma.ResponseCreateInput,
  ): Promise<Response> {
    return this.prisma.response.update({
      where: reponseWhereUniqueInput,
      data,
    });
  }

  remove(reponseWhereUniqueInput: Prisma.ResponseWhereUniqueInput) {
    return this.prisma.response.delete({
      where: reponseWhereUniqueInput,
    });
  }
}
