import { Test, TestingModule } from '@nestjs/testing';
import { FilieresController } from './filieres.controller';
import { FilieresService } from './filieres.service';

describe('FilieresController', () => {
  let controller: FilieresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilieresController],
      providers: [FilieresService],
    }).compile();

    controller = module.get<FilieresController>(FilieresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
