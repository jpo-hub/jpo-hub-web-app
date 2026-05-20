import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { AnswersService } from './answers.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnswersService', () => {
  let service: AnswersService;
  let prisma: any;

  const mockResponse = {
    uid: 'resp-1',
    label: 'Oui',
    questionId: 'quest-1',
  };

  beforeEach(async () => {
    prisma = {
      response: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      reponse_Filiere: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
      filiere: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      question: {
        findUnique: jest.fn(),
      },
      candidat_Filiere: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
      candidat: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AnswersService);
  });

  describe('findAll()', () => {
    it('should throw NotFoundException when no responses exist', async () => {
      prisma.response.findMany.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });

    it('should return list of responses with filieres', async () => {
      prisma.response.findMany.mockResolvedValue([
        {
          ...mockResponse,
          Reponse_Filiere: [{ filiere: { label: 'Informatique' }, score: 5 }],
        },
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].filieres).toEqual({ Informatique: 5 });
    });
  });

  describe('findOne()', () => {
    it('should throw NotFoundException when response does not exist', async () => {
      prisma.response.findUnique.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('should delete Reponse_Filiere associations then response', async () => {
      const responseWithFilieres = { ...mockResponse, Reponse_Filiere: [] };
      prisma.response.findUnique.mockResolvedValue(responseWithFilieres);
      prisma.reponse_Filiere.deleteMany.mockResolvedValue({});
      prisma.response.delete.mockResolvedValue(responseWithFilieres);

      await service.remove('resp-1');

      expect(prisma.reponse_Filiere.deleteMany).toHaveBeenCalledWith({
        where: { reponseId: 'resp-1' },
      });
      expect(prisma.response.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when response does not exist', async () => {
      prisma.response.findUnique.mockResolvedValue(null);

      await expect(service.remove('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should throw NotFoundException when response does not exist (P2025)', async () => {
      prisma.response.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: '7.0.0',
        }),
      );

      await expect(service.update('unknown', { label: 'Non' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException on duplicate label (P2002)', async () => {
      prisma.response.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );

      await expect(service.update('resp-1', { label: 'Duplicate' })).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
