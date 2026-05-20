import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FilieresController } from './filieres.controller';
import { FilieresService } from './filieres.service';

describe('FilieresController', () => {
  let controller: FilieresController;
  let service: jest.Mocked<FilieresService>;

  const mockFiliere = { uid: 'fil-1', label: 'Informatique' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilieresController],
      providers: [
        {
          provide: FilieresService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(FilieresController);
    service = module.get(FilieresService);
  });

  describe('create', () => {
    it('should call service.create with dto and return result', async () => {
      const dto = { label: 'Informatique' } as any;
      service.create.mockResolvedValue(mockFiliere);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockFiliere);
    });
  });

  describe('findAll', () => {
    it('should return all filieres', async () => {
      service.findAll.mockResolvedValue([mockFiliere]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return filiere when found', async () => {
      service.findOne.mockResolvedValue(mockFiliere);

      const result = await controller.findOne('fil-1');

      expect(service.findOne).toHaveBeenCalledWith('fil-1');
      expect(result).toBe(mockFiliere);
    });

    it('should throw NotFoundException when service returns null', async () => {
      service.findOne.mockResolvedValue(null as any);

      await expect(controller.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should call service.update with uid and dto', async () => {
      const dto = { label: 'IA & Data' } as any;
      service.update.mockResolvedValue({ ...mockFiliere, label: 'IA & Data' });

      const result = await controller.update('fil-1', dto);

      expect(service.update).toHaveBeenCalledWith('fil-1', dto);
      expect(result.label).toBe('IA & Data');
    });
  });

  describe('remove', () => {
    it('should call service.remove with uid', async () => {
      service.remove.mockResolvedValue(mockFiliere);

      const result = await controller.remove('fil-1');

      expect(service.remove).toHaveBeenCalledWith('fil-1');
      expect(result).toBe(mockFiliere);
    });
  });
});
