import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, Response } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

export type ResponseDto = {
  uid: string;
  label: string;
  questionUid: string;
  filieres: Record<string, number>;
};

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

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

  async traitementAnswer(CandidatUID: string, answerUID: string) {
    return this.prisma.$transaction(async (tx) => {
      const candidat = await tx.candidat.findUnique({
        where: { uid: CandidatUID },
        include: {
          Candidat_Filiere: {
            include: { filiere: true },
          },
        },
      });

      const answer = await tx.response.findUnique({
        where: { uid: answerUID },
        include: {
          Reponse_Filiere: {
            include: { filiere: true },
          },
        },
      });

      if (!candidat || !answer) {
        throw new NotFoundException('Candidat ou réponse non trouvée');
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
  }

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
            throw new NotFoundException(`Filière "${label}" non trouvée`);
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
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Question avec l'UID ${data.questionUid} non trouvée`,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Cette réponse existe déjà');
        }
      }
      throw new BadRequestException('Impossible de créer la réponse');
    }
  }

  async findAll(): Promise<ResponseDto[]> {
    const responses = await this.prisma.response.findMany({
      include: {
        Reponse_Filiere: {
          include: { filiere: { select: { label: true } } },
        },
      },
    });

    if (responses.length === 0) {
      throw new NotFoundException('Aucune réponse trouvée');
    }

    return responses.map((r) => this.toResponseDto(r));
  }

  async findOne(uid: string): Promise<ResponseDto> {
    const response = await this.prisma.response.findUnique({
      where: { uid },
      include: {
        Reponse_Filiere: {
          include: { filiere: { select: { label: true } } },
        },
      },
    });

    if (!response) {
      throw new NotFoundException(`Réponse avec l'UID ${uid} non trouvée`);
    }

    return this.toResponseDto(response);
  }

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
        if (error.code === 'P2025') {
          throw new NotFoundException(`Réponse avec l'UID ${uid} non trouvée`);
        }
      }
      throw new BadRequestException('Impossible de mettre à jour la réponse');
    }
  }

  async remove(uid: string): Promise<ResponseDto> {
    try {
      // Récupérer la réponse avant suppression pour le retour
      const response = await this.prisma.response.findUnique({
        where: { uid },
        include: {
          Reponse_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
        },
      });

      if (!response) {
        throw new NotFoundException(`Réponse avec l'UID ${uid} non trouvée`);
      }

      // Supprimer les relations puis la réponse
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
        if (error.code === 'P2025') {
          throw new NotFoundException(`Réponse avec l'UID ${uid} non trouvée`);
        }
      }
      throw new BadRequestException('Impossible de supprimer la réponse');
    }
  }
}
