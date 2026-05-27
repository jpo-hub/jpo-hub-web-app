import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ScoringService', () => {
  let service: ScoringService;
  let prisma: any;

  const mockCandidatRow = { uid: 'cand-1', email: 'test@test.com', firstname: 'John' };

  const makeAtelier = (uid: string, label: string, filiereLabel: string, score: number) => ({
    uid,
    label,
    imageUrl: null,
    description: null,
    draft: false,
    createAt: new Date(),
    updateAt: new Date(),
    dockerfilelink: null,
    Atelier_Filiere: [{ score, filiere: { label: filiereLabel } }],
    Atelier_Candidat: [],
  });

  beforeEach(async () => {
    prisma = {
      candidat: { findUnique: jest.fn() },
      candidat_Filiere: { findMany: jest.fn() },
      atelier_Candidat: { findMany: jest.fn() },
      atelier: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ScoringService);
  });

  describe('scoringCandidat()', () => {
    it('should throw NotFoundException when candidat does not exist', async () => {
      prisma.candidat.findUnique.mockResolvedValue(null);

      await expect(service.scoringCandidat({ uid: 'unknown' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array when candidat has no filiere scores', async () => {
      prisma.candidat.findUnique.mockResolvedValue(mockCandidatRow);
      prisma.candidat_Filiere.findMany.mockResolvedValue([]);
      prisma.atelier_Candidat.findMany.mockResolvedValue([]);

      const result = await service.scoringCandidat({ uid: 'cand-1' });

      expect(result).toEqual([]);
    });

    it('should return top 3 ateliers sorted by score for best filiere', async () => {
      prisma.candidat.findUnique.mockResolvedValue(mockCandidatRow);
      prisma.candidat_Filiere.findMany.mockResolvedValue([
        { filiere: { label: 'Informatique', uid: 'fil-1' }, score: 10 },
        { filiere: { label: 'IA', uid: 'fil-2' }, score: 3 },
      ]);
      prisma.atelier_Candidat.findMany.mockResolvedValue([]);
      prisma.atelier.findMany.mockResolvedValue([
        makeAtelier('atel-1', 'Atelier IA', 'Informatique', 5),
        makeAtelier('atel-2', 'Dev Web', 'Informatique', 3),
        makeAtelier('atel-3', 'Cybersécurité', 'Informatique', 8),
        makeAtelier('atel-4', 'Data Science', 'Informatique', 1),
      ]);

      const result = await service.scoringCandidat({ uid: 'cand-1' });

      expect(result).toHaveLength(3);
      expect(result[0].uid).toBe('atel-3'); // score 8 → premier
      expect(result[1].uid).toBe('atel-1'); // score 5 → deuxième
      expect(result[2].uid).toBe('atel-2'); // score 3 → troisième
    });
  });
});
