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
      // On peut exécuter les deux requêtes en parallèle pour gagner du temps
      const [
        stats,
        activeAteliersCount,
        candidatAppointmentCount,
        candidatsCount,
      ] = await Promise.all([
        this.prisma.filiereStats.findMany({
          include: {
            filiere: {
              select: { label: true },
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
      ]);

      if (!stats || stats.length === 0) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      const formattedStats = stats.reduce(
        (acc, curr) => {
          const label = curr.filiere.label;
          acc[label] = curr.selectionCount;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        filieres: formattedStats,
        ateliersActifs: activeAteliersCount,
        appointment: candidatAppointmentCount,
        candidats: candidatsCount,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }
}
