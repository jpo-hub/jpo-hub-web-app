import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';

describe('AnswersController', () => {
  let controller: AnswersController;
  let service: jest.Mocked<AnswersService>;

  const mockResponse = { uid: 'resp-1', label: 'Oui', filieres: {} } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswersController],
      providers: [
        {
          provide: AnswersService,
          useValue: {
            traitementAnswer: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AnswersController);
    service = module.get(AnswersService);
  });

  describe('create', () => {
    it('should call service.create with dto', async () => {
      const dto = { label: 'Oui', questionId: 'quest-1' } as any;
      service.create.mockResolvedValue(mockResponse);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockResponse);
    });
  });

  describe('findAll', () => {
    it('should return all responses', async () => {
      service.findAll.mockResolvedValue([mockResponse]);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with uid', async () => {
      service.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne('resp-1');

      expect(service.findOne).toHaveBeenCalledWith('resp-1');
      expect(result).toBe(mockResponse);
    });

    it('should propagate NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove with uid', async () => {
      service.remove.mockResolvedValue(mockResponse);

      await controller.remove('resp-1');

      expect(service.remove).toHaveBeenCalledWith('resp-1');
    });
  });
});
