import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from '../../generated/prisma/models/Question';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.QuestionCreateInput): Promise<Question> {
    try {
      return await this.prisma.question.create({
        data,
      });
    } catch (error) {
      console.error('Erreur création question:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Violation de contrainte unique
        if (error.code === 'P2002') {
          throw new ConflictException('Une question avec ce label existe déjà');
        }
      }
      throw new BadRequestException('Impossible de créer la question');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.QuestionWhereUniqueInput;
    where?: Prisma.QuestionWhereInput;
    orderBy?: Prisma.QuestionOrderByWithRelationInput;
  }): Promise<Question[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const questions = await this.prisma.question.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    if (questions.length === 0) {
      throw new NotFoundException('Aucune question trouvée');
    }

    return questions;
  }

  async findOne(uid: string): Promise<Question> {
    const question = await this.prisma.question.findUnique({
      where: { uid },
    });

    const reponses = await this.prisma.response.findMany({
      where: { questionId: uid },
    });

    if (!question) {
      throw new NotFoundException(`Question avec l'UID ${uid} non trouvée`);
    }

    return {
      ...question,
      reponses: reponses.map((r) => ({ ...r, questionId: undefined })),
    };
  }

  async update(uid: string, data: UpdateQuestionDto): Promise<Question> {
    try {
      return await this.prisma.question.update({
        where: { uid },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Question avec l'UID ${uid} non trouvée`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Une question avec ce label existe déjà');
        }
      }
      throw new BadRequestException('Impossible de mettre à jour la question');
    }
  }

  async remove(uid: string): Promise<Question> {
    try {
      return await this.prisma.question.delete({
        where: { uid },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Question avec l'UID ${uid} non trouvée`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Impossible de supprimer cette question car elle est utilisée par des réponses',
          );
        }
      }
      throw new BadRequestException('Impossible de supprimer la question');
    }
  }
}
