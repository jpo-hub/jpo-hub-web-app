import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatEntity } from './entities/stat.entity';
import { ERROR } from '../../common/constants/error.constants';
import { StatSnapshotEntity } from './entities/statSnapshot.entity';

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

      console.error('Error fetching stats:', error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération des statistiques',
      );
    }
  }

  /**
   * Crée un snapshot des statistiques actuelles
   *
   * @param label - Libellé du snapshot (ex: "JPO Janvier 2026")
   * @returns Le snapshot créé
   */
  async makeSnapshot(label: string): Promise<StatSnapshotEntity> {
    try {
      const currentStats = await this.findAll();

      const snapshot = await this.prisma.statsSnapshot.create({
        data: {
          label,
          data: JSON.parse(JSON.stringify(currentStats)),
        },
      });

      return {
        uid: snapshot.uid,
        label: snapshot.label,
        data: snapshot.data as StatSnapshotEntity['data'],
        timestamp: snapshot.timestamp,
      };
    } catch (error) {
      console.error('Error creating snapshot:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la création du snapshot',
      );
    }
  }

  /**
   * Récupère le dernier snapshot sauvegardé
   */
  async findLastSnapshot(): Promise<StatSnapshotEntity> {
    try {
      const snapshot = await this.prisma.statsSnapshot.findFirst({
        orderBy: { timestamp: 'desc' },
      });

      if (!snapshot) {
        throw new NotFoundException('Aucun snapshot trouvé');
      }

      return {
        uid: snapshot.uid,
        label: snapshot.label,
        data: snapshot.data as StatSnapshotEntity['data'],
        timestamp: snapshot.timestamp,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching snapshot:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération du snapshot',
      );
    }
  }

  /**
   * Récupère tous les snapshots
   */
  async findAllSnapshots(): Promise<StatSnapshotEntity[]> {
    try {
      const snapshots = await this.prisma.statsSnapshot.findMany({
        orderBy: { timestamp: 'desc' },
      });

      return snapshots.map((s) => ({
        uid: s.uid,
        label: s.label,
        data: s.data as StatSnapshotEntity['data'],
        timestamp: s.timestamp,
      }));
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des snapshots',
      );
    }
  }
}
