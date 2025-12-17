import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Candidat } from '../../generated/prisma/client';
import { CreateCandidatDto } from './dto/create-candidat.dto';
import { randomUUID } from 'crypto';

type CandidatDetailsDto = Candidat & {
  filieres: Record<string, number>;
  ateliers?: Array<{ uid: string; title: string; date: Date }>;
};

/**
 * Service de gestion des candidats.
 *
 * Règle de consentement appliquée ici :
 * - si `consentement === false`, on anonymise les données personnelles enregistrées
 *   (email/firstname/lastname/dateBirth) avec des valeurs “placeholder”.
 * - les filières peuvent être initialisées / mises à jour via un mapping `{ [label]: score }`
 *   et sont persistées via la table de jointure `candidat_Filiere`.
 */
@Injectable()
export class CandidatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère un candidat par critère unique (uid, email, etc.) et renvoie un DTO enrichi :
   * - `filieres` sous forme d'objet `{ [label]: score }`
   * - `ateliers` sous forme de liste `{ uid, title, date }`
   *
   * @param candidatWhereUniqueInput Critère unique Prisma.
   * @returns Le candidat enrichi (DTO).
   * @throws NotFoundException Si le candidat n'existe pas.
   * @throws BadRequestException Si la requête est invalide.
   *
   * @example
   * const candidat = await candidatsService.candidat({ uid: '...' });
   */
  async candidat(
    candidatWhereUniqueInput: Prisma.CandidatWhereUniqueInput,
  ): Promise<CandidatDetailsDto> {
    try {
      const candidat = await this.prisma.candidat.findUnique({
        where: candidatWhereUniqueInput,
      });

      if (!candidat) {
        throw new NotFoundException('Candidat not found');
      }

      const filieres = await this.prisma.candidat_Filiere.findMany({
        where: { candidatId: candidat.uid },
        include: { filiere: true },
      });

      const ateliers = await this.prisma.atelier_Candidat.findMany({
        where: { candidatId: candidat.uid },
        include: { atelier: true },
      });

      return {
        ...candidat,
        filieres: filieres.reduce<Record<string, number>>((acc, cf) => {
          acc[cf.filiere.label] = cf.score;
          return acc;
        }, {}),
        ateliers: ateliers.map((ac) => ({
          uid: ac.atelier.uid,
          title: ac.atelier.label,
          date: ac.atelier.date,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid candidat query');
      }

      throw new BadRequestException('Invalid candidat UID');
    }
  }

  async candidats(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CandidatWhereUniqueInput;
    where?: Prisma.CandidatWhereInput;
    orderBy?: Prisma.CandidatOrderByWithRelationInput;
  }): Promise<CandidatDetailsDto[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;

      if (
        (skip !== undefined && skip < 0) ||
        (take !== undefined && take <= 0)
      ) {
        throw new BadRequestException('Skip must be >= 0 and take must be > 0');
      }

      const candidats = await this.prisma.candidat.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });

      const candidatsWithDetails = await Promise.all(
        candidats.map(async (candidat) => {
          const filieres = await this.prisma.candidat_Filiere.findMany({
            where: { candidatId: candidat.uid },
            include: { filiere: true },
          });

          const ateliers = await this.prisma.atelier_Candidat.findMany({
            where: { candidatId: candidat.uid },
            include: { atelier: true },
          });

          return {
            ...candidat,
            filieres: filieres.reduce<Record<string, number>>((acc, cf) => {
              acc[cf.filiere.label] = cf.score;
              return acc;
            }, {}),
            ateliers: ateliers.map((ac) => ({
              uid: ac.atelier.uid,
              title: ac.atelier.label,
              date: ac.atelier.date,
            })),
          };
        }),
      );

      return candidatsWithDetails;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to fetch candidats');
    }
  }

  /**
   * Crée un candidat.
   *
   * Particularités :
   * - si `consentement === false`, les champs personnels sont anonymisés avant insertion.
   * - si `data.filieres` est fourni (mapping `{ [label]: score }`), les lignes de jointure
   *   `candidat_Filiere` sont créées/mises à jour automatiquement en transaction.
   *
   * @param data Données de création + éventuellement `filieres`.
   * @returns Le candidat créé + `filieres` sous forme d'objet `{ [label]: score }`.
   * @throws ConflictException En cas de conflit d'unicité (ex: email).
   * @throws BadRequestException Si les données sont invalides.
   * @throws InternalServerErrorException En cas d'erreur inattendue.
   */
  async createCandidat(data: CreateCandidatDto): Promise<CandidatDetailsDto> {
    try {
      const filieresInput = data.filieres ?? {};

      const entries = Object.entries(filieresInput)
        .map(([label, score]) => [String(label).trim(), Number(score)] as const)
        .filter(
          ([label, score]) =>
            label.length > 0 && Number.isFinite(score) && score >= 0,
        );

      return await this.prisma.$transaction(async (tx) => {
        const anonymize = data.consentement === false;

        const candidatData: Prisma.CandidatCreateInput = {
          email: anonymize
            ? `placeholder+${randomUUID()}@example.invalid`
            : data.email,
          firstname: anonymize ? 'ANONYME' : data.firstname,
          lastname: anonymize ? 'ANONYME' : data.lastname,
          dateBirth: anonymize ? new Date('1970-01-01') : data.dateBirth,
          appointment: data.appointment,
          consentement: data.consentement,
        };

        const candidat = await tx.candidat.create({ data: candidatData });

        for (const [label, score] of entries) {
          const filiere = await tx.filiere.upsert({
            where: { label },
            update: {},
            create: { label },
          });

          await tx.candidat_Filiere.upsert({
            where: {
              candidatId_filiereId: {
                candidatId: candidat.uid,
                filiereId: filiere.uid,
              },
            },
            update: { score },
            create: {
              candidatId: candidat.uid,
              filiereId: filiere.uid,
              score,
            },
          });
        }

        const filieresRows = await tx.candidat_Filiere.findMany({
          where: { candidatId: candidat.uid },
          include: { filiere: true },
        });

        return {
          ...candidat,
          filieres: filieresRows.reduce<Record<string, number>>((acc, cf) => {
            acc[cf.filiere.label] = cf.score;
            return acc;
          }, {}),
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Conflit d’unicité (email ou filière).');
      }
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Impossible de créer le candidat.',
      );
    }
  }

  /**
   * Met à jour un candidat existant.
   *
   * Particularités :
   * - si `data.consentement` est fourni et vaut `false`, on anonymise les champs personnels.
   * - si `data.filieres` est fourni (mapping `{ [label]: score }`), les scores sont upsert
   *   dans la table de jointure `candidat_Filiere`.
   *
   * @param params.where Critère unique Prisma (uid, email, etc.)
   * @param params.data Données de mise à jour + éventuellement `filieres`.
   * @returns Le candidat mis à jour + `filieres` sous forme d'objet `{ [label]: score }`.
   * @throws NotFoundException Si le candidat n'existe pas.
   * @throws ConflictException En cas de conflit d'unicité (ex: email).
   * @throws BadRequestException Si la mise à jour échoue.
   * @throws InternalServerErrorException En cas d'erreur inattendue.
   */
  async updateCandidat(params: {
    where: Prisma.CandidatWhereUniqueInput;
    data: Prisma.CandidatUpdateInput & { filieres?: Record<string, number> };
  }): Promise<CandidatDetailsDto> {
    try {
      const { where } = params;
      const { filieres: filieresInput, ...updateData } = params.data;

      const candidat = await this.prisma.candidat.findUnique({ where });
      if (!candidat) {
        throw new NotFoundException('Candidat not found');
      }

      const entries = Object.entries(filieresInput ?? {})
        .map(([label, score]) => [String(label).trim(), Number(score)] as const)
        .filter(
          ([label, score]) =>
            label.length > 0 && Number.isFinite(score) && score >= 0,
        );

      return await this.prisma.$transaction(async (tx) => {
        const anonymize =
          updateData.consentement !== undefined &&
          updateData.consentement === false;

        const prismaUpdate: Prisma.CandidatUpdateInput = {
          ...updateData,
          ...(anonymize
            ? {
                email: `placeholder+${randomUUID()}@example.invalid`,
                firstname: 'ANONYME',
                lastname: 'ANONYME',
                dateBirth: new Date('1970-01-01'),
              }
            : {}),
        };

        const updated = await tx.candidat.update({
          where,
          data: prismaUpdate,
        });

        for (const [label, score] of entries) {
          const filiere = await tx.filiere.upsert({
            where: { label },
            update: {},
            create: { label },
          });

          await tx.candidat_Filiere.upsert({
            where: {
              candidatId_filiereId: {
                candidatId: updated.uid,
                filiereId: filiere.uid,
              },
            },
            update: { score },
            create: {
              candidatId: updated.uid,
              filiereId: filiere.uid,
              score,
            },
          });
        }

        const filieresRows = await tx.candidat_Filiere.findMany({
          where: { candidatId: updated.uid },
          include: { filiere: true },
        });

        return {
          ...updated,
          filieres: filieresRows.reduce<Record<string, number>>((acc, cf) => {
            acc[cf.filiere.label] = cf.score;
            return acc;
          }, {}),
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already in use');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('Candidat not found');
        }
      }

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update candidat');
    }
  }

  /**
   * Supprime un candidat de la base de données
   * @async
   * @param {Prisma.CandidatWhereUniqueInput} where - Critère de recherche unique du candidat à supprimer
   * @returns {Promise<Candidat>} Les données du candidat supprimé
   * @throws {NotFoundException} Si le candidat n'existe pas
   * @throws {BadRequestException} En cas d'erreur de suppression
   *
   * @example
   * const deletedCandidat = await candidatsService.deleteCandidat({ uid: '123' });
   */
  async deleteCandidat(
    where: Prisma.CandidatWhereUniqueInput,
  ): Promise<Candidat> {
    try {
      const candidat = await this.prisma.candidat.findUnique({ where });

      if (!candidat) {
        throw new NotFoundException('Candidat not found');
      }

      return await this.prisma.$transaction(async (tx) => {
        await tx.candidat_Filiere.deleteMany({
          where: { candidatId: candidat.uid },
        });

        await tx.atelier_Candidat.deleteMany({
          where: { candidatId: candidat.uid },
        });

        return tx.candidat.delete({
          where: { uid: candidat.uid },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          "Impossible de supprimer ce candidat : il est encore lié à d'autres données.",
        );
      }

      throw new BadRequestException('Failed to delete candidat');
    }
  }
}
