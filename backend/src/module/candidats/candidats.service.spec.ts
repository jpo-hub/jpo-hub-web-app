import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CandidatsService } from './candidats.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CandidatsService', () => {
  let service: CandidatsService;
  let prisma: any;

  const mockCandidatRow = {
    uid: 'abc-123',
    email: 'john@example.com',
    firstname: 'John',
    lastname: 'Doe',
    ageRange: '18-25',
    appointment: false,
    consentement: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      candidat: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      candidat_Filiere: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        upsert: jest.fn(),
        create: jest.fn(),
      },
      atelier_Candidat: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      filiere: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      stats: { upsert: jest.fn() },
      globalStats: { updateMany: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CandidatsService);
  });

  describe('candidat()', () => {
    it('should return enriched candidat when found', async () => {
      prisma.candidat.findUnique.mockResolvedValue(mockCandidatRow);
      prisma.candidat_Filiere.findMany.mockResolvedValue([
        { filiere: { label: 'Informatique' }, score: 5 },
      ]);
      prisma.atelier_Candidat.findMany.mockResolvedValue([
        {
          atelier: { uid: 'atel-1', label: 'Atelier IA', createAt: new Date() },
        },
      ]);

      const result = await service.candidat({ uid: 'abc-123' });

      expect(result.uid).toBe('abc-123');
      expect(result.filieres).toEqual({ Informatique: 5 });
      expect(result.ateliers).toHaveLength(1);
    });

    it('should throw NotFoundException when candidat does not exist', async () => {
      prisma.candidat.findUnique.mockResolvedValue(null);

      await expect(service.candidat({ uid: 'unknown' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('candidats()', () => {
    it('should throw BadRequestException when skip is negative', async () => {
      await expect(service.candidats({ skip: -1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when take is 0', async () => {
      await expect(service.candidats({ take: 0 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return list of enriched candidats', async () => {
      prisma.candidat.findMany.mockResolvedValue([mockCandidatRow]);
      prisma.candidat_Filiere.findMany.mockResolvedValue([]);
      prisma.atelier_Candidat.findMany.mockResolvedValue([]);

      const result = await service.candidats({ skip: 0, take: 10 });

      expect(result).toHaveLength(1);
      expect(result[0].uid).toBe('abc-123');
      expect(result[0].filieres).toEqual({});
    });
  });

  describe('createCandidat()', () => {
    beforeEach(() => {
      prisma.$transaction.mockImplementation((fn: any) => fn(prisma));
      prisma.filiere.findMany.mockResolvedValue([]);
      prisma.candidat_Filiere.findMany.mockResolvedValue([]);
      prisma.atelier_Candidat.findMany.mockResolvedValue([]);
      prisma.globalStats.updateMany.mockResolvedValue({});
    });

    it('should anonymize personal data when consentement is false', async () => {
      prisma.candidat.create.mockResolvedValue({
        ...mockCandidatRow,
        email: 'placeholder+uuid@example.invalid',
        firstname: 'ANONYME',
        lastname: 'ANONYME',
        consentement: false,
      });

      await service.createCandidat({ consentement: false } as any);

      const createdData = prisma.candidat.create.mock.calls[0][0].data;
      expect(createdData.firstname).toBe('ANONYME');
      expect(createdData.lastname).toBe('ANONYME');
      expect(createdData.email).toMatch(/^placeholder\+/);
    });

    it('should keep real data when consentement is true', async () => {
      prisma.candidat.create.mockResolvedValue(mockCandidatRow);

      await service.createCandidat({
        email: 'john@example.com',
        firstname: 'John',
        lastname: 'Doe',
        consentement: true,
      } as any);

      const createdData = prisma.candidat.create.mock.calls[0][0].data;
      expect(createdData.firstname).toBe('John');
      expect(createdData.email).toBe('john@example.com');
      expect(createdData.consentement).toBe(true);
    });
  });

  describe('deleteCandidat()', () => {
    it('should throw NotFoundException when candidat does not exist', async () => {
      prisma.candidat.findUnique.mockResolvedValue(null);

      await expect(service.deleteCandidat({ uid: 'unknown' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete associations then candidat in transaction', async () => {
      prisma.candidat.findUnique.mockResolvedValue(mockCandidatRow);
      prisma.$transaction.mockImplementation((fn: any) => fn(prisma));
      prisma.candidat_Filiere.deleteMany.mockResolvedValue({});
      prisma.atelier_Candidat.deleteMany.mockResolvedValue({});
      prisma.candidat.delete.mockResolvedValue(mockCandidatRow);

      await service.deleteCandidat({ uid: 'abc-123' });

      expect(prisma.candidat_Filiere.deleteMany).toHaveBeenCalledWith({
        where: { candidatId: 'abc-123' },
      });
      expect(prisma.atelier_Candidat.deleteMany).toHaveBeenCalledWith({
        where: { candidatId: 'abc-123' },
      });
      expect(prisma.candidat.delete).toHaveBeenCalled();
    });
  });
});
