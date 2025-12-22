import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Atelier, Candidat, Prisma } from '../../generated/prisma/client';
import { AtelierDetailsDto } from '../ateliers/ateliers.service';

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

  private toApiAtelier(
    atelier: {
      Atelier_Filiere?: Array<{ score: number; filiere: { label: string } }>;
      Atelier_Candidat?: Array<{ candidatId: string }>;
    } & Atelier,
  ): AtelierDetailsDto {
    const filiere: Record<string, number> = {};
    for (const af of atelier.Atelier_Filiere ?? []) {
      filiere[af.filiere.label] = af.score;
    }

    return {
      uid: atelier.uid,
      label: atelier.label,
      imageUrl: atelier.imageUrl,
      description: atelier.description,
      draft: atelier.draft,
      createAt: atelier.createAt,
      updateAt: atelier.updateAt,
      dockerfilelink: atelier.dockerfilelink,
      filiere,
      candidats: (atelier.Atelier_Candidat ?? []).map((ac) => ac.candidatId),
    };
  }

  async scoringCandidat(
    candidatWhereUniqueInput: Prisma.CandidatWhereUniqueInput,
  ) {
    try {
      const candidat = await this.prisma.candidat.findUnique({
        where: candidatWhereUniqueInput,
      });

      if (!candidat) {
        throw new NotFoundException('Candidat not found');
      }

      const candidatDetails = await this.enrichCandidatDetails(candidat);

      // Trouver la filière avec le score le plus élevé
      const filieres = candidatDetails.filieres;
      const bestFiliere = Object.entries(filieres).reduce(
        (best, [label, score]) => {
          if (score > best.score) {
            return { label, score };
          }
          return best;
        },
        { label: '', score: -Infinity },
      );

      // Récupérer les ateliers liés à la meilleure filière
      let top3Ateliers: AtelierDetailsDto[] = [];

      if (bestFiliere.label) {
        const ateliers = await this.prisma.atelier.findMany({
          where: {
            Atelier_Filiere: {
              some: {
                filiere: { label: bestFiliere.label },
              },
            },
          },
          include: {
            Atelier_Filiere: {
              include: { filiere: { select: { label: true } } },
            },
            Atelier_Candidat: { select: { candidatId: true } },
          },
        });

        // Trier par score décroissant pour la filière et prendre les 3 premiers
        top3Ateliers = ateliers
          .map((atelier) => this.toApiAtelier(atelier))
          .sort((a, b) => {
            const scoreA = a.filiere[bestFiliere.label] ?? 0;
            const scoreB = b.filiere[bestFiliere.label] ?? 0;
            return scoreB - scoreA;
          })
          .slice(0, 3);
      }

      return top3Ateliers;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid candidat query');
      }

      throw new BadRequestException('Invalid candidat UID');
    }
  }
}
