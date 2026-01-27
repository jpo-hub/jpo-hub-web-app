import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Candidat, Prisma } from '../../generated/prisma/client';
import { CreateCandidatDto } from './dto/create-candidat.dto';
import { randomUUID } from 'crypto';
import { ERROR } from '../../common/constants/error.constants';

/**
 * DTO enrichi d'un candidat avec ses filières et ateliers.
 */
type CandidatDetailsDto = Candidat & {
  filieres: Record<string, number>;
  ateliers?: Array<{ uid: string; label: string; createAt: Date }>;
};

/**
 * Service de gestion des candidats.
 *
 * @description
 * Gère les opérations CRUD sur les candidats avec les règles métier suivantes :
 * - Si `consentement === false`, les données personnelles sont anonymisées
 *   (email, firstname, lastname, dateBirth).
 * - Les filières sont gérées via un mapping `{ [label]: score }` et persistées
 *   dans la table de jointure `Candidat_Filiere`.
 *
 * @class CandidatsService
 */
@Injectable()
export class CandidatsService {
  constructor(private prisma: PrismaService) {}

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
        label: ac.atelier.label,
        createAt: ac.atelier.createAt,
      })),
    };
  }

  /**
   * Récupère un candidat par critère unique.
   *
   * @async
   * @param {Prisma.CandidatWhereUniqueInput} candidatWhereUniqueInput - Critère unique (uid, email, etc.).
   * @returns {Promise<CandidatDetailsDto>} Le candidat enrichi avec ses filières et ateliers.
   * @throws {NotFoundException} Si le candidat n'existe pas.
   * @throws {BadRequestException} Si le critère de recherche est invalide.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * // Recherche par UID
   * const candidat = await candidatsService.candidat({ uid: 'abc-123' });
   *
   * @example
   * // Recherche par email
   * const candidat = await candidatsService.candidat({ email: 'test@example.com' });
   */
  async candidat(
    candidatWhereUniqueInput: Prisma.CandidatWhereUniqueInput,
  ): Promise<CandidatDetailsDto> {
    try {
      const candidat = await this.prisma.candidat.findUnique({
        where: candidatWhereUniqueInput,
      });

      if (!candidat) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      return this.enrichCandidatDetails(candidat);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Récupère une liste paginée de candidats.
   *
   * @async
   * @param {Object} params - Paramètres de pagination et filtrage.
   * @param {number} [params.skip] - Nombre d'éléments à ignorer (offset). Doit être >= 0.
   * @param {number} [params.take] - Nombre d'éléments à récupérer (limit). Doit être > 0.
   * @param {Prisma.CandidatWhereUniqueInput} [params.cursor] - Curseur pour la pagination.
   * @param {Prisma.CandidatWhereInput} [params.where] - Filtres de recherche.
   * @param {Prisma.CandidatOrderByWithRelationInput} [params.orderBy] - Tri des résultats.
   * @returns {Promise<CandidatDetailsDto[]>} Liste des candidats enrichis.
   * @throws {BadRequestException} Si les paramètres de pagination sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * // Récupérer les 10 premiers candidats
   * const candidats = await candidatsService.candidats({ take: 10 });
   *
   * @example
   * // Pagination : page 2 avec 20 éléments par page
   * const candidats = await candidatsService.candidats({ skip: 20, take: 20 });
   */
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
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      const candidats = await this.prisma.candidat.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });

      return Promise.all(
        candidats.map((candidat) => this.enrichCandidatDetails(candidat)),
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Crée un nouveau candidat.
   *
   * @async
   * @param {CreateCandidatDto} data - Données de création du candidat.
   * @returns {Promise<CandidatDetailsDto>} Le candidat créé avec ses détails enrichis.
   * @throws {ConflictException} Si un conflit d'unicité survient (email existant).
   * @throws {NotFoundException} Si une ressource référencée n'existe pas.
   * @throws {BadRequestException} Si les données sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @description
   * Comportements spécifiques :
   * - Si `consentement === false`, les champs personnels sont anonymisés.
   * - Si `filieres` est fourni, les scores sont enregistrés pour chaque filière.
   * - Toutes les filières existantes non mentionnées sont initialisées avec un score de 0.
   *
   * @example
   * // Créer un candidat avec consentement
   * const candidat = await candidatsService.createCandidat({
   *   email: 'john@example.com',
   *   firstname: 'John',
   *   lastname: 'Doe',
   *   ageRange: '26-35',
   *   consentement: true,
   *   filieres: { informatique: 5, ia-&-data: 3 }
   * });
   *
   * @example
   * // Créer un candidat anonyme (sans consentement)
   * const candidat = await candidatsService.createCandidat({
   *   consentement: false,
   *   filieres: { informatique: 2 }
   * });
   */
  async createCandidat(data: CreateCandidatDto): Promise<CandidatDetailsDto> {
    try {
      const filieresInput = data.filieres ?? {};

      const isConsentGiven =
        data.consentement || String(data.consentement) === 'true';
      const hasAppointment =
        data.appointment || String(data.appointment) === 'true';
      const anonymize = !isConsentGiven;

      return await this.prisma.$transaction(async (tx) => {
        const allFilieres = await tx.filiere.findMany();

        const candidatData: Prisma.CandidatCreateInput = {
          email: anonymize
            ? `placeholder+${randomUUID()}@example.invalid`
            : data.email || `missing-${randomUUID()}@example.com`,
          firstname: anonymize ? 'ANONYME' : data.firstname || 'INCONNU',
          lastname: anonymize ? 'ANONYME' : data.lastname || 'INCONNU',
          ageRange: anonymize ? 'ANONYME' : data.ageRange || 'INCONNU',
          appointment: hasAppointment,
          consentement: isConsentGiven,
        };

        const candidat = await tx.candidat.create({ data: candidatData });

        const processedLabels = new Set<string>();

        for (const [label, score] of Object.entries(filieresInput)) {
          const trimmedLabel = label.trim();
          if (!trimmedLabel) continue;

          const filiere = await tx.filiere.upsert({
            where: { label: trimmedLabel },
            update: {},
            create: { label: trimmedLabel },
          });

          await tx.candidat_Filiere.upsert({
            where: {
              candidatId_filiereId: {
                candidatId: candidat.uid,
                filiereId: filiere.uid,
              },
            },
            update: { score: Number(score) },
            create: {
              candidatId: candidat.uid,
              filiereId: filiere.uid,
              score: Number(score),
            },
          });

          await tx.stats.upsert({
            where: { filiereId: filiere.uid },
            update: {
              selectionCount: { increment: 1 },
            },
            create: {
              filiereId: filiere.uid,
              selectionCount: 1,
            },
          });

          processedLabels.add(trimmedLabel);
        }

        for (const filiere of allFilieres) {
          if (!processedLabels.has(filiere.label)) {
            await tx.candidat_Filiere.create({
              data: {
                candidatId: candidat.uid,
                filiereId: filiere.uid,
                score: 0,
              },
            });
          }
        }

        await tx.globalStats.updateMany({
          data: { candidats: { increment: 1 } },
        });

        return this.enrichCandidatDetails(candidat, tx);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ConflictException(ERROR.EmailAlreadyExists);
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Met à jour un candidat existant.
   *
   * @async
   * @param {Object} params - Paramètres de mise à jour.
   * @param {Prisma.CandidatWhereUniqueInput} params.where - Critère unique (uid, email, etc.).
   * @param {Prisma.CandidatUpdateInput & { filieres?: Record<string, number> }} params.data - Données à mettre à jour.
   * @returns {Promise<CandidatDetailsDto>} Le candidat mis à jour avec ses filières.
   * @throws {NotFoundException} Si le candidat n'existe pas.
   * @throws {ConflictException} En cas de conflit d'unicité (email déjà utilisé).
   * @throws {BadRequestException} Si les données sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @description
   * Comportements spécifiques :
   * - Si `consentement` passe à `false`, les champs personnels sont anonymisés.
   * - Si `filieres` est fourni, les scores sont mis à jour (upsert).
   * - Les scores négatifs ou labels vides sont ignorés.
   *
   * @example
   * // Mettre à jour le nom et les filières
   * const candidat = await candidatsService.updateCandidat({
   *   where: { uid: 'abc-123' },
   *   data: {
   *     firstname: 'Jane',
   *     filieres: { informatique: 10 }
   *   }
   * });
   *
   * @example
   * // Anonymiser un candidat
   * const candidat = await candidatsService.updateCandidat({
   *   where: { uid: 'abc-123' },
   *   data: { consentement: false }
   * });
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
        throw new NotFoundException(ERROR.ResourceNotFound);
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
        switch (error.code) {
          case 'P2002':
            throw new ConflictException(ERROR.AlreadyExists);
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Supprime un candidat et toutes ses associations.
   *
   * @async
   * @param {Prisma.CandidatWhereUniqueInput} where - Critère unique du candidat à supprimer.
   * @returns {Promise<Candidat>} Les données du candidat supprimé.
   * @throws {NotFoundException} Si le candidat n'existe pas.
   * @throws {ConflictException} Si le candidat est encore lié à d'autres données non supprimables.
   * @throws {BadRequestException} Si la suppression échoue.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @description
   * Cette méthode supprime en cascade :
   * - Les associations `Candidat_Filiere`
   * - Les associations `Atelier_Candidat`
   * - Le candidat lui-même
   *
   * @example
   * // Supprimer par UID
   * const deleted = await candidatsService.deleteCandidat({ uid: 'abc-123' });
   * console.log(`Candidat ${deleted.firstname} supprimé`);
   *
   * @example
   * // Supprimer par email
   * const deleted = await candidatsService.deleteCandidat({ email: 'john@example.com' });
   */
  async deleteCandidat(
    where: Prisma.CandidatWhereUniqueInput,
  ): Promise<Candidat> {
    try {
      const candidat = await this.prisma.candidat.findUnique({ where });

      if (!candidat) {
        throw new NotFoundException(ERROR.ResourceNotFound);
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

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2003':
            throw new ConflictException(ERROR.ConflictError);
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
