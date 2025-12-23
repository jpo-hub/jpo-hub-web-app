import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Atelier, Candidat, Prisma } from '../../generated/prisma/client';
import { AtelierDetailsDto } from '../ateliers/ateliers.service';
import { ERROR } from '../../common/constants/error.constants';

/**
 * DTO enrichi d'un candidat avec ses filières et ateliers.
 */
type CandidatDetailsDto = Candidat & {
  filieres: Record<string, number>;
  ateliers?: Array<{ uid: string; title: string; date: Date }>;
};

/**
 * Service de scoring des candidats.
 *
 * @description
 * Analyse les scores des filières d'un candidat et recommande les ateliers
 * les plus pertinents en fonction de sa meilleure filière.
 *
 * @class ScoringService
 */
@Injectable()
export class ScoringService {
  /**
   * Crée une instance du service ScoringService.
   *
   * @param {PrismaService} prisma - Service Prisma pour l'accès à la base de données.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enrichit un candidat avec ses filières et ateliers associés.
   *
   * @private
   * @async
   * @param {Candidat} candidat - Le candidat à enrichir.
   * @param {Prisma.TransactionClient | PrismaService} [tx=this.prisma] - Client Prisma ou transaction.
   * @returns {Promise<CandidatDetailsDto>} Le candidat enrichi avec :
   *   - `filieres`: objet `{ [label]: score }`
   *   - `ateliers`: liste `{ uid, title, date }`
   */
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

  /**
   * Convertit une entité Atelier en DTO enrichi.
   *
   * @private
   * @param {Atelier & { Atelier_Filiere?: Array<...>; Atelier_Candidat?: Array<...> }} atelier - L'atelier avec ses relations.
   * @returns {AtelierDetailsDto} Le DTO avec :
   *   - `filiere`: objet `{ [label]: score }`
   *   - `candidats`: liste des UIDs des candidats
   */
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

  /**
   * Calcule le scoring d'un candidat et retourne les 3 meilleurs ateliers recommandés.
   *
   * @async
   * @param {Prisma.CandidatWhereUniqueInput} candidatWhereUniqueInput - Critère unique du candidat (uid, email, etc.).
   * @returns {Promise<AtelierDetailsDto[]>} Les 3 ateliers les plus pertinents pour le candidat.
   * @throws {NotFoundException} Si le candidat n'existe pas.
   * @throws {BadRequestException} Si le critère de recherche est invalide.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @description
   * Algorithme de scoring :
   * 1. Récupère les scores du candidat par filière.
   * 2. Identifie la filière avec le score le plus élevé.
   * 3. Récupère tous les ateliers liés à cette filière.
   * 4. Trie les ateliers par score décroissant pour cette filière.
   * 5. Retourne les 3 premiers ateliers.
   *
   * @example
   * const topAteliers = await scoringService.scoringCandidat({ uid: 'cand-123' });
   * // Retourne les 3 ateliers les plus adaptés au profil du candidat
   *
   * @example
   * const topAteliers = await scoringService.scoringCandidat({ email: 'john@example.com' });
   */
  async scoringCandidat(
    candidatWhereUniqueInput: Prisma.CandidatWhereUniqueInput,
  ) {
    try {
      const candidat = await this.prisma.candidat.findUnique({
        where: candidatWhereUniqueInput,
      });

      if (!candidat) {
        throw new NotFoundException(ERROR.ResourceNotFound);
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
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }
}
