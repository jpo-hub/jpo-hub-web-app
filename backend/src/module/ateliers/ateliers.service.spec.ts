import { Test, TestingModule } from '@nestjs/testing';
import { AteliersService } from './ateliers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('AteliersService', () => {
  let service: AteliersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AteliersService,
        { provide: PrismaService, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('mock-value'),
          },
        },
      ],
    }).compile();

    service = module.get<AteliersService>(AteliersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
