import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, Response } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { ERROR } from '../../common/constants/error.constants';

/**
 * DTO de réponse enrichi avec les scores par filière.
 */
export type ResponseDto = {
  uid: string;
  label: string;
  questionUid: string;
  filieres: Record<string, number>;
};

/**
 * Service de gestion des réponses (answers).
 *
 * @description
 * Gère les opérations CRUD sur les réponses et le traitement des scores :
 * - Chaque réponse est liée à une question.
 * - Chaque réponse peut avoir des scores associés à différentes filières.
 * - Le traitement d'une réponse pour un candidat additionne les scores aux filières du candidat.
 *
 * @class AnswersService
 */
@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Convertit une entité Response en DTO enrichi.
   *
   * @private
   * @param {Response & { Reponse_Filiere: Array<{ score: number; filiere: { label: string } }> }} response - La réponse avec ses filières.
   * @returns {ResponseDto} Le DTO avec les filières sous forme d'objet `{ [label]: score }`.
   */
  private toResponseDto(
    response: Response & {
      Reponse_Filiere: Array<{ score: number; filiere: { label: string } }>;
    },
  ): ResponseDto {
    const filieres: Record<string, number> = {};
    for (const rf of response.Reponse_Filiere) {
      filieres[rf.filiere.label] = rf.score;
    }

    return {
      uid: response.uid,
      label: response.label,
      questionUid: response.questionId,
      filieres,
    };
  }

  /**
   * Traite une réponse pour un candidat en additionnant les scores des filières.
   *
   * @async
   * @param {string} CandidatUID - L'UID du candidat.
   * @param {string} answerUID - L'UID de la réponse à traiter.
   * @returns {Promise<{ message: string }>} Message de confirmation.
   * @throws {NotFoundException} Si le candidat ou la réponse n'existe pas.
   * @throws {BadRequestException} Si la réponse ne contient aucune filière.
   * @throws {ConflictException} En cas de conflit lors de la mise à jour.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @description
   * Cette méthode effectue les opérations suivantes dans une transaction :
   * 1. Récupère le candidat avec ses filières actuelles.
   * 2. Récupère la réponse avec ses scores par filière.
   * 3. Pour chaque filière de la réponse :
   *    - Si le candidat a déjà cette filière : additionne les scores.
   *    - Sinon : crée une nouvelle association avec le score de la réponse.
   *
   * @example
   * // Traiter la réponse "resp-456" pour le candidat "cand-123"
   * const result = await answersService.traitementAnswer('cand-123', 'resp-456');
   * // { message: 'Scores mis à jour avec succès' }
   */
  async traitementAnswer(CandidatUID: string, answerUID: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const candidat = await tx.candidat.findUnique({
          where: { uid: CandidatUID },
          include: {
            Candidat_Filiere: {
              include: { filiere: true },
            },
          },
        });

        if (!candidat) {
          throw new NotFoundException(ERROR.ResourceNotFound);
        }

        const answer = await tx.response.findUnique({
          where: { uid: answerUID },
          include: {
            Reponse_Filiere: {
              include: { filiere: true },
            },
          },
        });

        if (!answer) {
          throw new NotFoundException(ERROR.ResourceNotFound);
        }

        if (answer.Reponse_Filiere.length === 0) {
          throw new BadRequestException(ERROR.InvalidInputFormat);
        }

        for (const rf of answer.Reponse_Filiere) {
          const candidatFiliere = candidat.Candidat_Filiere.find(
            (cf) => cf.filiere.uid === rf.filiere.uid,
          );

          if (candidatFiliere) {
            await tx.candidat_Filiere.update({
              where: {
                candidatId_filiereId: {
                  candidatId: candidatFiliere.candidatId,
                  filiereId: candidatFiliere.filiereId,
                },
              },
              data: {
                score: candidatFiliere.score + rf.score,
              },
            });
          } else {
            await tx.candidat_Filiere.create({
              data: {
                candidat: { connect: { uid: CandidatUID } },
                filiere: { connect: { uid: rf.filiere.uid } },
                score: rf.score,
              },
            });
          }
        }

        return { message: 'Scores mis à jour avec succès' };
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          case 'P2002':
            throw new ConflictException(ERROR.AlreadyExists);
          case 'P2003':
            throw new BadRequestException(ERROR.InvalidInputFormat);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Crée une nouvelle réponse avec ses scores par filière.
   *
   * @async
   * @param {CreateAnswerDto} data - Données de création de la réponse.
   * @returns {Promise<ResponseDto>} La réponse créée avec ses filières.
   * @throws {NotFoundException} Si la question ou une filière n'existe pas.
   * @throws {ConflictException} Si une réponse identique existe déjà.
   * @throws {BadRequestException} Si les données sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const answer = await answersService.create({
   *   label: 'Oui, je suis intéressé',
   *   questionUid: 'quest-123',
   *   filieres: { informatique: 3, marketing: 1 }
   * });
   */
  async create(data: CreateAnswerDto): Promise<ResponseDto> {
    try {
      const reponseFiliereData: Prisma.Reponse_FiliereCreateWithoutResponseInput[] =
        [];

      if (data.filieres) {
        for (const [label, score] of Object.entries(data.filieres)) {
          const filiere = await this.prisma.filiere.findFirst({
            where: { label },
          });
          if (!filiere) {
            throw new NotFoundException(ERROR.ResourceNotFound);
          }
          reponseFiliereData.push({
            score,
            filiere: { connect: { uid: filiere.uid } },
          });
        }
      }

      const response = await this.prisma.response.create({
        data: {
          label: data.label,
          question: {
            connect: { uid: data.questionUid },
          },
          Reponse_Filiere: {
            create: reponseFiliereData,
          },
        },
        include: {
          Reponse_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
        },
      });

      return this.toResponseDto(response);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

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

  /**
   * Récupère toutes les réponses.
   *
   * @async
   * @returns {Promise<ResponseDto[]>} Liste de toutes les réponses avec leurs filières.
   * @throws {NotFoundException} Si aucune réponse n'existe.
   * @throws {BadRequestException} Si la requête est invalide.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const answers = await answersService.findAll();
   * // [{ uid: '...', label: '...', questionUid: '...', filieres: {...} }, ...]
   */
  async findAll(): Promise<ResponseDto[]> {
    try {
      const responses = await this.prisma.response.findMany({
        include: {
          Reponse_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
        },
      });

      if (responses.length === 0) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      return responses.map((r) => this.toResponseDto(r));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Récupère une réponse par son UID.
   *
   * @async
   * @param {string} uid - L'UID de la réponse.
   * @returns {Promise<ResponseDto>} La réponse avec ses filières.
   * @throws {NotFoundException} Si la réponse n'existe pas.
   * @throws {BadRequestException} Si l'UID est invalide.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const answer = await answersService.findOne('resp-123');
   * // { uid: 'resp-123', label: '...', questionUid: '...', filieres: {...} }
   */
  async findOne(uid: string): Promise<ResponseDto> {
    try {
      const response = await this.prisma.response.findUnique({
        where: { uid },
        include: {
          Reponse_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
        },
      });

      if (!response) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      return this.toResponseDto(response);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Met à jour une réponse existante.
   *
   * @async
   * @param {string} uid - L'UID de la réponse à mettre à jour.
   * @param {UpdateAnswerDto} data - Données de mise à jour.
   * @returns {Promise<ResponseDto>} La réponse mise à jour avec ses filières.
   * @throws {NotFoundException} Si la réponse n'existe pas.
   * @throws {ConflictException} En cas de conflit d'unicité.
   * @throws {BadRequestException} Si les données sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const updated = await answersService.update('resp-123', {
   *   label: 'Nouvelle réponse modifiée'
   * });
   */
  async update(uid: string, data: UpdateAnswerDto): Promise<ResponseDto> {
    try {
      const response = await this.prisma.response.update({
        where: { uid },
        data: {
          label: data.label,
        },
        include: {
          Reponse_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
        },
      });

      return this.toResponseDto(response);
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

  /**
   * Supprime une réponse et ses associations avec les filières.
   *
   * @async
   * @param {string} uid - L'UID de la réponse à supprimer.
   * @returns {Promise<ResponseDto>} La réponse supprimée.
   * @throws {NotFoundException} Si la réponse n'existe pas.
   * @throws {ConflictException} Si la réponse est encore liée à d'autres données.
   * @throws {BadRequestException} Si la suppression échoue.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @description
   * Cette méthode supprime en cascade :
   * 1. Les associations `Reponse_Filiere` liées à la réponse.
   * 2. La réponse elle-même.
   *
   * @example
   * const deleted = await answersService.remove('resp-123');
   * console.log(`Réponse "${deleted.label}" supprimée`);
   */
  async remove(uid: string): Promise<ResponseDto> {
    try {
      const response = await this.prisma.response.findUnique({
        where: { uid },
        include: {
          Reponse_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
        },
      });

      if (!response) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      await this.prisma.reponse_Filiere.deleteMany({
        where: { reponseId: uid },
      });

      await this.prisma.response.delete({
        where: { uid },
      });

      return this.toResponseDto(response);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          case 'P2003':
            throw new ConflictException(ERROR.ConflictError);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }
}
