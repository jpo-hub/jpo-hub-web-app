import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';

describe('AdminsController', () => {
  let controller: AdminsController;
  let service: jest.Mocked<AdminsService>;

  const mockAdmin = { uid: 'admin-1', email: 'admin@test.com' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminsController],
      providers: [
        {
          provide: AdminsService,
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

    controller = module.get(AdminsController);
    service = module.get(AdminsService);
  });

  describe('create', () => {
    it('should call service.create with dto', async () => {
      const dto = { email: 'admin@test.com', password: 'pw' } as any;
      service.create.mockResolvedValue(mockAdmin);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockAdmin);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with uid', async () => {
      service.findOne.mockResolvedValue(mockAdmin);

      const result = await controller.findOne('admin-1');

      expect(service.findOne).toHaveBeenCalledWith('admin-1');
      expect(result).toBe(mockAdmin);
    });

    it('should propagate NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should call service.update with uid and dto', async () => {
      const dto = { email: 'new@test.com' } as any;
      service.update.mockResolvedValue({ ...mockAdmin, email: 'new@test.com' });

      await controller.update('admin-1', dto);

      expect(service.update).toHaveBeenCalledWith('admin-1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove with uid', async () => {
      service.remove.mockResolvedValue(mockAdmin);

      await controller.remove('admin-1');

      expect(service.remove).toHaveBeenCalledWith('admin-1');
    });
  });
});
