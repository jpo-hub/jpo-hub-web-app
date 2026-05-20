import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

describe('ScoringController', () => {
  let controller: ScoringController;
  let service: jest.Mocked<ScoringService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoringController],
      providers: [
        {
          provide: ScoringService,
          useValue: {
            scoringCandidat: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ScoringController);
    service = module.get(ScoringService);
  });

  describe('findByUserAndAtelier', () => {
    it('should call service with candidat uid', async () => {
      const mockResult = [{ uid: 'atel-1' }] as any;
      service.scoringCandidat.mockResolvedValue(mockResult);

      const result = await controller.findByUserAndAtelier('cand-1');

      expect(service.scoringCandidat).toHaveBeenCalledWith({ uid: 'cand-1' });
      expect(result).toBe(mockResult);
    });

    it('should propagate NotFoundException', async () => {
      service.scoringCandidat.mockRejectedValue(new NotFoundException());

      await expect(controller.findByUserAndAtelier('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
