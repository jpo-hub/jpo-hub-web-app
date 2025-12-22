import { Test, TestingModule } from '@nestjs/testing';
import { FilieresService } from './filieres.service';

describe('FilieresService', () => {
  let service: FilieresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilieresService],
    }).compile();

    service = module.get<FilieresService>(FilieresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
