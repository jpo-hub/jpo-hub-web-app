import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Candidat, Prisma } from '@prisma/client';

@Injectable()
export class CandidatsService {
  constructor(private prisma: PrismaService) {}

  async candidat(
    candidatWhereUniqueInput: Prisma.CandidatWhereUniqueInput,
  ): Promise<Candidat | null> {
    return this.prisma.candidat.findUnique({
      where: candidatWhereUniqueInput,
    });
  }

  async candidats(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CandidatWhereUniqueInput;
    where?: Prisma.CandidatWhereInput;
    orderBy?: Prisma.CandidatOrderByWithRelationInput;
  }): Promise<Candidat[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.candidat.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createCandidat(data: Prisma.CandidatCreateInput): Promise<Candidat> {
    return this.prisma.candidat.create({
      data,
    });
  }

  async updateCandidat(params: {
    where: Prisma.CandidatWhereUniqueInput;
    data: Prisma.CandidatUpdateInput;
  }): Promise<Candidat> {
    const { where, data } = params;
    return this.prisma.candidat.update({
      data,
      where,
    });
  }

  async deleteCandidat(
    where: Prisma.CandidatWhereUniqueInput,
  ): Promise<Candidat> {
    return this.prisma.candidat.delete({
      where,
    });
  }
}
