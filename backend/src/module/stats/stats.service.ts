import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatEntity } from './entities/stat.entity';
import { ERROR } from '../../common/constants/error.constants'; // Ajustez le chemin selon votre projet

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère les statistiques de sélection pour toutes les filières.
   *
   * @async
   * @returns {Promise<StatEntity>} Un objet contenant les statistiques formatées par libellé de filière.
   * @throws {NotFoundException} Si aucune statistique n'est trouvée.
   * @throws {InternalServerErrorException} En cas d'erreur lors de la récupération ou du formatage.
   *
   * @example
   * const stats = await statsService.findAll();
   * // Retourne: { filieres: { "informatique": 5, "ia-&-data": 3 } }
   */
  async findAll(): Promise<StatEntity> {
    try {
      const [
        filieresRaw,
        activeAteliersCount,
        candidatAppointmentCount,
        candidatsCount,
        topAteliersRaw,
      ] = await Promise.all([
        this.prisma.filiere.findMany({
          select: {
            label: true,
            filiereStats: {
              select: { selectionCount: true },
            },
          },
        }),
        this.prisma.atelier.count({
          where: { draft: false },
        }),
        this.prisma.candidat.count({
          where: { appointment: true },
        }),
        this.prisma.candidat.count(),
        this.prisma.atelier.findMany({
          where: { draft: false },
          take: 3,
          orderBy: {
            Atelier_Candidat: {
              _count: 'desc',
            },
          },
          select: {
            uid: true,
            label: true,
            _count: { select: { Atelier_Candidat: true } },
          },
        }),
      ]);

      if (!filieresRaw || filieresRaw.length === 0) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      const formattedStats = filieresRaw.reduce(
        (acc, f) => {
          acc[f.label] = f.filiereStats?.selectionCount ?? 0;
          return acc;
        },
        {} as Record<string, number>,
      );

      const topAteliers = topAteliersRaw.map((a) => ({
        uid: a.uid,
        label: a.label,
        candidatsCount: a._count.Atelier_Candidat,
      }));

      return {
        filieres: formattedStats,
        ateliersActifs: activeAteliersCount,
        appointment: candidatAppointmentCount,
        candidats: candidatsCount,
        topAteliers,
      } as StatEntity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }
}
