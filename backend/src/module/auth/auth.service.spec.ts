import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: jest.Mocked<JwtService>;

  const mockAdmin = {
    uid: 'admin-1',
    email: 'admin@test.com',
    password: 'hashed-password',
  };

  beforeEach(async () => {
    prisma = {
      admin: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('jwt-token') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  describe('login()', () => {
    it('should return accessToken when credentials are valid', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.login('admin@test.com', 'correct-password');

      expect(result).toHaveProperty('accessToken');
      expect(jwtService.sign).toHaveBeenCalledWith({ adminUid: mockAdmin.uid });
    });

    it('should throw BadRequestException when email not found', async () => {
      prisma.admin.findUnique.mockResolvedValue(null);

      await expect(
        service.login('unknown@test.com', 'password'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is invalid', async () => {
      prisma.admin.findUnique.mockResolvedValue(mockAdmin);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.login('admin@test.com', 'wrong-password'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
