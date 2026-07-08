import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

describe('StatsController', () => {
  let controller: StatsController;
  let service: jest.Mocked<StatsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: {
            findAll: jest.fn(),
            makeSnapshot: jest.fn(),
            findLastSnapshot: jest.fn(),
            findAllSnapshots: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(StatsController);
    service = module.get(StatsService);
  });

  describe('findAll', () => {
    it('should return aggregated stats', async () => {
      const mockStats = { filieres: [], candidats: 10 } as any;
      service.findAll.mockResolvedValue(mockStats);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(mockStats);
    });
  });

  describe('makeSnapshot', () => {
    it('should call service with label', async () => {
      const mockSnapshot = { id: 1, label: 'JPO Mai' } as any;
      service.makeSnapshot.mockResolvedValue(mockSnapshot);

      const result = await controller.makeSnapshot('JPO Mai');

      expect(service.makeSnapshot).toHaveBeenCalledWith('JPO Mai');
      expect(result).toBe(mockSnapshot);
    });
  });

  describe('findLastSnapshot', () => {
    it('should return last snapshot', async () => {
      const mockSnapshot = { id: 1, label: 'JPO Mai' } as any;
      service.findLastSnapshot.mockResolvedValue(mockSnapshot);

      const result = await controller.findLastSnapshot();

      expect(result).toBe(mockSnapshot);
    });

    it('should propagate NotFoundException', async () => {
      service.findLastSnapshot.mockRejectedValue(new NotFoundException());

      await expect(controller.findLastSnapshot()).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
