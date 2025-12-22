import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Candidat, Prisma } from '../../generated/prisma/client';

type CandidatDetailsDto = Candidat & {
  filieres: Record<string, number>;
  ateliers?: Array<{ uid: string; title: string; date: Date }>;
};

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  private async enrichCandidatDetails(
    candidat: Candidat,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<CandidatDetailsDto> {
    const [filieres, ateliers] = await Promise.all([
      tx.candidat_Filiere.findMany({
        where: { candidatId: candidat.uid },
        include: { filiere: true },
      }),
      tx.atelier_Candidat.findMany({
        where: { candidatId: candidat.uid },
        include: { atelier: true },
      }),
    ]);

    return {
      ...candidat,
      filieres: filieres.reduce<Record<string, number>>((acc, cf) => {
        acc[cf.filiere.label] = cf.score;
        return acc;
      }, {}),
      ateliers: ateliers.map((ac) => ({
        uid: ac.atelier.uid,
        title: ac.atelier.label,
        date: ac.atelier.createAt,
      })),
    };
  }

  async scoringCandidat(
    candidatWhereUniqueInput: Prisma.CandidatWhereUniqueInput,
  ): Promise<CandidatDetailsDto> {
    try {
      const candidat = await this.prisma.candidat.findUnique({
        where: candidatWhereUniqueInput,
      });

      if (!candidat) {
        throw new NotFoundException('Candidat not found');
      }

      return this.enrichCandidatDetails(candidat);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid candidat query');
      }

      throw new BadRequestException('Invalid candidat UID');
    }
  }
}
