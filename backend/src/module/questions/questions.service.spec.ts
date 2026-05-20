import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { QuestionsService } from './questions.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let prisma: any;

  const mockQuestion = {
    uid: 'quest-1',
    label: 'Quel est votre domaine préféré ?',
    draft: false,
    multiple: false,
  };

  beforeEach(async () => {
    prisma = {
      question: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      response: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(QuestionsService);
  });

  describe('create()', () => {
    it('should create and return question', async () => {
      prisma.question.create.mockResolvedValue(mockQuestion);

      const result = await service.create({
        label: 'Quel est votre domaine préféré ?',
      } as any);

      expect(result).toEqual(mockQuestion);
    });

    it('should throw ConflictException on duplicate label (P2002)', async () => {
      prisma.question.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );

      await expect(
        service.create({ label: 'Question dupliquée' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll()', () => {
    it('should return non-draft questions', async () => {
      prisma.question.findMany.mockResolvedValue([mockQuestion]);

      const result = await service.findAll();

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { draft: false },
      });
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException when no questions exist', async () => {
      prisma.question.findMany.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne()', () => {
    it('should return question with reponses', async () => {
      prisma.question.findUnique.mockResolvedValue(mockQuestion);
      prisma.response.findMany.mockResolvedValue([
        {
          uid: 'resp-1',
          label: 'Informatique',
          Reponse_Filiere: [{ filiere: { label: 'Informatique' }, score: 5 }],
        },
      ]);

      const result = await service.findOne('quest-1');

      expect(result.uid).toBe('quest-1');
    });

    it('should throw NotFoundException when question does not exist', async () => {
      prisma.question.findUnique.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('should delete responses then question', async () => {
      prisma.question.findUnique.mockResolvedValue(mockQuestion);
      prisma.question.findMany.mockResolvedValue([mockQuestion]);
      prisma.response.deleteMany.mockResolvedValue({});
      prisma.question.delete.mockResolvedValue(mockQuestion);

      await service.remove('quest-1');

      expect(prisma.response.deleteMany).toHaveBeenCalledWith({
        where: { questionId: 'quest-1' },
      });
      expect(prisma.question.delete).toHaveBeenCalled();
    });
  });
});
