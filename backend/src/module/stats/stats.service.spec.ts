import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StatsService } from './stats.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('StatsService', () => {
  let service: StatsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      stats: { findMany: jest.fn() },
      atelier: { count: jest.fn(), findMany: jest.fn() },
      globalStats: { findFirst: jest.fn(), updateMany: jest.fn() },
      candidat: { count: jest.fn() },
      statsSnapshot: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(StatsService);
  });

  describe('findLastSnapshot()', () => {
    it('should return last snapshot', async () => {
      const mockSnapshot = {
        uid: 'snap-1',
        label: 'JPO Mai',
        timestamp: new Date(),
        data: {},
      };
      prisma.statsSnapshot.findFirst.mockResolvedValue(mockSnapshot);

      const result = await service.findLastSnapshot();

      expect(prisma.statsSnapshot.findFirst).toHaveBeenCalledWith({
        orderBy: { timestamp: 'desc' },
      });
      expect(result.label).toBe('JPO Mai');
    });

    it('should throw NotFoundException when no snapshot exists', async () => {
      prisma.statsSnapshot.findFirst.mockResolvedValue(null);

      await expect(service.findLastSnapshot()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllSnapshots()', () => {
    it('should return all snapshots ordered by timestamp desc', async () => {
      const mockSnapshots = [
        { uid: 'snap-2', label: 'JPO Juin', timestamp: new Date(), data: {} },
        { uid: 'snap-1', label: 'JPO Mai', timestamp: new Date(), data: {} },
      ];
      prisma.statsSnapshot.findMany.mockResolvedValue(mockSnapshots);

      const result = await service.findAllSnapshots();

      expect(prisma.statsSnapshot.findMany).toHaveBeenCalledWith({
        orderBy: { timestamp: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].label).toBe('JPO Juin');
    });

    it('should return empty array when no snapshots', async () => {
      prisma.statsSnapshot.findMany.mockResolvedValue([]);

      const result = await service.findAllSnapshots();

      expect(result).toEqual([]);
    });
  });
});
