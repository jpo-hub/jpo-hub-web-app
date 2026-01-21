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
      const stats = await this.prisma.filiereStats.findMany({
        include: {
          filiere: {
            select: {
              label: true,
            },
          },
        },
      });

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
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }
}
