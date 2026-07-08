import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CandidatsController } from './candidats.controller';
import { CandidatsService } from './candidats.service';

describe('CandidatsController', () => {
  let controller: CandidatsController;
  let service: jest.Mocked<CandidatsService>;

  const mockCandidat = {
    uid: 'abc-123',
    firstname: 'John',
    lastname: 'Doe',
    filieres: {},
    ateliers: [],
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatsController],
      providers: [
        {
          provide: CandidatsService,
          useValue: {
            createCandidat: jest.fn(),
            candidats: jest.fn(),
            candidat: jest.fn(),
            updateCandidat: jest.fn(),
            deleteCandidat: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CandidatsController);
    service = module.get(CandidatsService);
  });

  describe('createCandidat', () => {
    it('should call service with body and return result', async () => {
      const dto = { firstname: 'John', consentement: true } as any;
      service.createCandidat.mockResolvedValue(mockCandidat);

      const result = await controller.createCandidat(dto);

      expect(service.createCandidat).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockCandidat);
    });
  });

  describe('findAll', () => {
    it('should calculate skip from page and limit', () => {
      service.candidats.mockResolvedValue([]);

      controller.findAll('3', '5', 'asc');

      expect(service.candidats).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should default to page 1, limit 10, no orderBy', () => {
      service.candidats.mockResolvedValue([]);

      controller.findAll();

      expect(service.candidats).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: undefined,
      });
    });

    it('should pass orderBy desc', () => {
      service.candidats.mockResolvedValue([]);

      controller.findAll('1', '10', 'desc');

      expect(service.candidats).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOneByUid', () => {
    it('should call service with uid and return result', async () => {
      service.candidat.mockResolvedValue(mockCandidat);

      const result = await controller.findOneByUid('abc-123');

      expect(service.candidat).toHaveBeenCalledWith({ uid: 'abc-123' });
      expect(result).toBe(mockCandidat);
    });

    it('should propagate NotFoundException from service', async () => {
      service.candidat.mockRejectedValue(new NotFoundException());

      await expect(controller.findOneByUid('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateByUid', () => {
    it('should call service with where and data', async () => {
      const dto = { firstname: 'Jane' } as any;
      service.updateCandidat.mockResolvedValue(mockCandidat);

      const result = await controller.updateByUid('abc-123', dto);

      expect(service.updateCandidat).toHaveBeenCalledWith({
        where: { uid: 'abc-123' },
        data: dto,
      });
      expect(result).toBe(mockCandidat);
    });
  });

  describe('remove', () => {
    it('should call service with uid', async () => {
      service.deleteCandidat.mockResolvedValue(mockCandidat);

      const result = await controller.remove('abc-123');

      expect(service.deleteCandidat).toHaveBeenCalledWith({ uid: 'abc-123' });
      expect(result).toBe(mockCandidat);
    });

    it('should propagate NotFoundException from service', async () => {
      service.deleteCandidat.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
