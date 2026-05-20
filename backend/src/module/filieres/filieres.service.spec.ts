import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { FilieresService } from './filieres.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FilieresService', () => {
  let service: FilieresService;
  let prisma: any;

  const mockFiliere = { uid: 'fil-1', label: 'Informatique' };

  beforeEach(async () => {
    prisma = {
      filiere: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilieresService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(FilieresService);
  });

  describe('create()', () => {
    it('should create and return filiere', async () => {
      prisma.filiere.create.mockResolvedValue(mockFiliere);

      const result = await service.create({ label: 'Informatique' });

      expect(prisma.filiere.create).toHaveBeenCalledWith({
        data: { label: 'Informatique' },
      });
      expect(result).toEqual(mockFiliere);
    });

    it('should throw ConflictException on duplicate label (P2002)', async () => {
      const prismaError = Object.assign(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );
      prisma.filiere.create.mockRejectedValue(prismaError);

      await expect(service.create({ label: 'Informatique' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll()', () => {
    it('should return all filieres', async () => {
      prisma.filiere.findMany.mockResolvedValue([mockFiliere]);

      const result = await service.findAll();

      expect(result).toEqual([mockFiliere]);
    });
  });

  describe('findOne()', () => {
    it('should return filiere when found', async () => {
      prisma.filiere.findUnique.mockResolvedValue(mockFiliere);

      const result = await service.findOne('fil-1');

      expect(prisma.filiere.findUnique).toHaveBeenCalledWith({
        where: { uid: 'fil-1' },
      });
      expect(result).toEqual(mockFiliere);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.filiere.findUnique.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('should update and return filiere', async () => {
      const updated = { ...mockFiliere, label: 'IA & Data' };
      prisma.filiere.update.mockResolvedValue(updated);

      const result = await service.update('fil-1', { label: 'IA & Data' });

      expect(result.label).toBe('IA & Data');
    });

    it('should throw NotFoundException when filiere does not exist (P2025)', async () => {
      prisma.filiere.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Not found', {
          code: 'P2025',
          clientVersion: '7.0.0',
        }),
      );

      await expect(service.update('unknown', { label: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('should delete and return filiere', async () => {
      prisma.filiere.delete.mockResolvedValue(mockFiliere);

      const result = await service.remove('fil-1');

      expect(prisma.filiere.delete).toHaveBeenCalledWith({
        where: { uid: 'fil-1' },
      });
      expect(result).toEqual(mockFiliere);
    });

    it('should throw ConflictException when filiere is still referenced (P2003)', async () => {
      prisma.filiere.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Foreign key constraint', {
          code: 'P2003',
          clientVersion: '7.0.0',
        }),
      );

      await expect(service.remove('fil-1')).rejects.toThrow(ConflictException);
    });
  });
});
