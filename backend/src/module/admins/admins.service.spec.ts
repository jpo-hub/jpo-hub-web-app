import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client';
import { AdminsService } from './admins.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AdminsService', () => {
  let service: AdminsService;
  let prisma: any;

  const mockAdmin = {
    uid: 'admin-1',
    email: 'admin@test.com',
    password: 'hashed-pw',
  };

  beforeEach(async () => {
    prisma = {
      admin: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AdminsService);
  });

  describe('create()', () => {
    it('should hash password and create admin', async () => {
      mockBcrypt.hash.mockResolvedValue('hashed-pw' as never);
      prisma.admin.create.mockResolvedValue(mockAdmin);

      await service.create({
        email: 'admin@test.com',
        password: 'plain-pw',
      } as any);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('plain-pw', 10);
      const createdData = prisma.admin.create.mock.calls[0][0].data;
      expect(createdData.password).toBe('hashed-pw');
    });

    it('should throw ConflictException on duplicate email (P2002)', async () => {
      mockBcrypt.hash.mockResolvedValue('hashed-pw' as never);
      prisma.admin.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '7.0.0',
        }),
      );

      await expect(
        service.create({ email: 'admin@test.com', password: 'pw' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne()', () => {
    it('should return admin when found', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);

      const result = await service.findOne('admin-1');

      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { uid: 'admin-1' },
        omit: { password: true },
      });
      expect(result).toEqual(mockAdmin);
    });

    it('should throw NotFoundException when admin does not exist', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('should hash new password when provided', async () => {
      mockBcrypt.hash.mockResolvedValue('new-hashed-pw' as never);
      prisma.admin.update.mockResolvedValue({
        ...mockAdmin,
        password: 'new-hashed-pw',
      });

      await service.update('admin-1', { password: 'new-plain-pw' } as any);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('new-plain-pw', 10);
      const updatedData = prisma.admin.update.mock.calls[0][0].data;
      expect(updatedData.password).toBe('new-hashed-pw');
    });

    it('should not call bcrypt when password is not updated', async () => {
      prisma.admin.update.mockResolvedValue(mockAdmin);
      mockBcrypt.hash.mockClear();

      await service.update('admin-1', { email: 'new@test.com' } as any);

      expect(mockBcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should delete and return admin', async () => {
      prisma.admin.delete.mockResolvedValue(mockAdmin);

      const result = await service.remove('admin-1');

      expect(prisma.admin.delete).toHaveBeenCalledWith({
        where: { uid: 'admin-1' },
        omit: { password: true },
      });
      expect(result).toEqual(mockAdmin);
    });
  });
});
