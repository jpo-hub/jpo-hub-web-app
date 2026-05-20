import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let service: jest.Mocked<QuestionsService>;

  const mockQuestion = { uid: 'quest-1', label: 'Question test' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllQuestions: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(QuestionsController);
    service = module.get(QuestionsService);
  });

  describe('create', () => {
    it('should call service.create with dto', async () => {
      const dto = { label: 'Question test' } as any;
      service.create.mockResolvedValue(mockQuestion);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockQuestion);
    });
  });

  describe('findAll', () => {
    it('should return published questions', async () => {
      service.findAll.mockResolvedValue([mockQuestion]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should propagate NotFoundException when no questions', async () => {
      service.findAll.mockRejectedValue(new NotFoundException());

      await expect(controller.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with uid', async () => {
      service.findOne.mockResolvedValue(mockQuestion);

      const result = await controller.findOne('quest-1');

      expect(service.findOne).toHaveBeenCalledWith('quest-1');
      expect(result).toBe(mockQuestion);
    });
  });

  describe('remove', () => {
    it('should call service.remove with uid', async () => {
      service.remove.mockResolvedValue(mockQuestion);

      await controller.remove('quest-1');

      expect(service.remove).toHaveBeenCalledWith('quest-1');
    });
  });
});
