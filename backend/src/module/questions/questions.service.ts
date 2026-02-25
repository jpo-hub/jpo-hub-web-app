import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from '../../generated/prisma/models/Question';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR } from '../../common/constants/error.constants';

/**
 * Service de gestion des questions.
 *
 * @description
 * Gère les opérations CRUD sur les questions.
 * Chaque question peut avoir plusieurs réponses associées.
 *
 * @class QuestionsService
 */
@Injectable()
export class QuestionsService {
  /**
   * Crée une instance du service QuestionsService.
   *
   * @param {PrismaService} prisma - Service Prisma pour l'accès à la base de données.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une nouvelle question.
   *
   * @async
   * @param {Prisma.QuestionCreateInput} data - Données de création de la question.
   * @returns {Promise<Question>} La question créée.
   * @throws {ConflictException} Si une question avec ce label existe déjà.
   * @throws {BadRequestException} Si les données sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const question = await questionsService.create({ label: 'Quel est votre domaine préféré ?' });
   */
  async create(data: Prisma.QuestionCreateInput): Promise<Question> {
    try {
      return await this.prisma.question.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
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
   * Récupère une liste paginée de questions.
   *
   * @async
   * @param {Object} params - Paramètres de pagination et filtrage.
   * @param {number} [params.skip] - Nombre d'éléments à ignorer (offset).
   * @param {number} [params.take] - Nombre d'éléments à récupérer (limit).
   * @param {Prisma.QuestionWhereUniqueInput} [params.cursor] - Curseur pour la pagination.
   * @param {Prisma.QuestionWhereInput} [params.where] - Filtres de recherche.
   * @param {Prisma.QuestionOrderByWithRelationInput} [params.orderBy] - Tri des résultats.
   * @returns {Promise<Question[]>} Liste des questions.
   * @throws {NotFoundException} Si aucune question n'est trouvée.
   * @throws {BadRequestException} Si les paramètres sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const questions = await questionsService.findAll({ take: 10 });
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.QuestionWhereUniqueInput;
    where?: Prisma.QuestionWhereInput;
    orderBy?: Prisma.QuestionOrderByWithRelationInput;
  }): Promise<Question[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;
      const questions = await this.prisma.question.findMany({
        skip,
        take,
        cursor,
        where: {
          ...where,
          draft: false,
        },
        orderBy,
      });

      if (questions.length === 0) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      return questions;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Récupère une question par son UID avec ses réponses.
   *
   * @async
   * @param {string} uid - L'UID de la question.
   * @returns {Promise<Question>} La question avec ses réponses.
   * @throws {NotFoundException} Si la question n'existe pas.
   * @throws {BadRequestException} Si l'UID est invalide.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const question = await questionsService.findOne('quest-123');
   * // { uid: 'quest-123', label: '...', reponses: [...] }
   */
  async findOne(uid: string): Promise<Question> {
    try {
      const question = await this.prisma.question.findUnique({
        where: { uid },
      });

      if (!question) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      const reponses = await this.prisma.response.findMany({
        where: {
          questionId: uid,
        },
        include: {
          Reponse_Filiere: {
            include: {
              filiere: {
                select: {
                  label: true,
                },
              },
            },
          },
        },
      });

      return {
        ...question,
        reponses: reponses.map((r) => ({
          uid: r.uid,
          label: r.label,
          filieres: r.Reponse_Filiere.reduce(
            (acc, rf) => {
              acc[rf.filiere.label] = rf.score;
              return acc;
            },
            {} as Record<string, number>,
          ),
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Met à jour une question existante.
   *
   * @async
   * @param {string} uid - L'UID de la question à mettre à jour.
   * @param {UpdateQuestionDto} data - Données de mise à jour.
   * @returns {Promise<Question>} La question mise à jour.
   * @throws {NotFoundException} Si la question n'existe pas.
   * @throws {ConflictException} Si le nouveau label existe déjà.
   * @throws {BadRequestException} Si les données sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const question = await questionsService.update('quest-123', { label: 'Nouvelle question ?' });
   */
  async update(uid: string, data: UpdateQuestionDto): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { uid },
        data,
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

  /**
   * Supprime une question.
   *
   * @async
   * @param {string} uid - L'UID de la question à supprimer.
   * @returns {Promise<Question>} La question supprimée.
   * @throws {NotFoundException} Si la question n'existe pas.
   * @throws {ConflictException} Si la question est encore utilisée par des réponses.
   * @throws {BadRequestException} Si la suppression échoue.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @description
   * La suppression échouera si la question est référencée par des réponses.
   *
   * @example
   * const deleted = await questionsService.remove('quest-123');
   * console.log(`Question "${deleted.label}" supprimée`);
   */
  async remove(uid: string): Promise<Question> {
    try {
      return await this.prisma.question.delete({
        where: { uid },
      });
    } catch (error) {
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
