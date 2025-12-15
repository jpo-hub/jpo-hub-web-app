import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Candidat } from '../../generated/prisma/client';
import { CreateCandidatDto } from './dto/create-candidat.dto';

/**
 * Service de gestion des candidats
 * @class CandidatsService
 * @description Fournit les opérations CRUD et les requêtes spécialisées pour les candidats
 */
@Injectable()
export class CandidatsService {
  /**
   * Initialise le service avec l'instance Prisma
   * @param {PrismaService} prisma - Service d'accès à la base de données
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Récupère un candidat par son identifiant unique avec tous ses scores par filière
   * @async
   * @param {Prisma.CandidatWhereUniqueInput} candidatWhereUniqueInput - Critère de recherche unique (uid, email, etc.)
   * @returns {Promise<{uid: string, firstname: string, lastname: string, email: string, dateBirth: Date, Filiere: Record<string, number>}>} Les données du candidat avec les scores agrégés
   * @throws {NotFoundException} Si le candidat n'existe pas
   * @throws {BadRequestException} Si l'UID du candidat est invalide
   *
   * @example
   * const candidat = await candidatsService.candidat({ uid: '123' });
   */
  async candidat(
    candidatWhereUniqueInput: Prisma.CandidatWhereUniqueInput,
  ): Promise<any> {
    try {
      const candidat = await this.prisma.candidat.findUnique({
        where: candidatWhereUniqueInput,
      });

      if (!candidat) {
        throw new NotFoundException('Candidat not found');
      }

      // Récupérer les scores pour toutes les filieres
      const scores = await this.prisma.candidat_Score.findMany({
        where: { candidatId: candidat.uid },
        include: { filiere: true },
      });

      // Récupérer toutes les filieres
      const allFilieres = await this.prisma.filiere.findMany();

      // Créer un objet avec les scores (0 par défaut s'il n'existe pas)
      const filiereScores: Record<string, number> = {};
      for (const filiere of allFilieres) {
        const score = scores.find((s) => s.filiereId === filiere.uid);
        filiereScores[filiere.label.toLowerCase()] = score?.score ?? 0;
      }

      // Récupérer les ateliers du candidat
      const ateliers = await this.prisma.atelier_Candidat.findMany({
        where: {
          candidatId: candidat.uid,
        },
        include: { atelier: true },
      });

      // Formater les ateliers avec toutes leurs informations
      const ateliersFormatted = ateliers.map((ac) => ({
        uid: ac.atelier.uid,
        label: ac.atelier.label,
      }));

      return {
        uid: candidat.uid,
        firstname: candidat.firstname,
        lastname: candidat.lastname,
        email: candidat.email,
        dateBirth: candidat.dateBirth,
        filieres: filiereScores,
        workshop: ateliersFormatted,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid candidat UID');
    }
  }

  /**
   * Récupère une liste paginée de candidats avec filtrage et tri
   * @async
   * @param {Object} params - Paramètres de requête
   * @param {number} [params.skip] - Nombre d'enregistrements à sauter (pagination)
   * @param {number} [params.take] - Nombre d'enregistrements à retourner
   * @param {Prisma.CandidatWhereUniqueInput} [params.cursor] - Curseur pour la pagination par curseur
   * @param {Prisma.CandidatWhereInput} [params.where] - Critères de filtrage
   * @param {Prisma.CandidatOrderByWithRelationInput} [params.orderBy] - Critères de tri
   * @returns {Promise<any[]>} Tableau des candidats avec leurs filières et ateliers
   * @throws {BadRequestException} Si les paramètres de pagination sont invalides ou en cas d'erreur de base de données
   */
  async candidats(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CandidatWhereUniqueInput;
    where?: Prisma.CandidatWhereInput;
    orderBy?: Prisma.CandidatOrderByWithRelationInput;
  }): Promise<any[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;

      // Validation des paramètres de pagination
      if (
        (skip !== undefined && skip < 0) ||
        (take !== undefined && take <= 0)
      ) {
        throw new BadRequestException('Skip must be >= 0 and take must be > 0');
      }

      const candidats = await this.prisma.candidat.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });

      // Récupérer les données enrichies pour chaque candidat
      const candidatsEnrichis = await Promise.all(
        candidats.map(async (candidat) => {
          // Récupérer les scores pour toutes les filieres
          const scores = await this.prisma.candidat_Score.findMany({
            where: { candidatId: candidat.uid },
            include: { filiere: true },
          });

          // Récupérer toutes les filieres
          const allFilieres = await this.prisma.filiere.findMany();

          // Créer un objet avec les scores (0 par défaut s'il n'existe pas)
          const filiereScores: Record<string, number> = {};
          for (const filiere of allFilieres) {
            const score = scores.find((s) => s.filiereId === filiere.uid);
            filiereScores[filiere.label.toLowerCase()] = score?.score ?? 0;
          }

          // Récupérer les ateliers du candidat
          const ateliers = await this.prisma.atelier_Candidat.findMany({
            where: {
              candidatId: candidat.uid,
            },
            include: { atelier: true },
          });

          // Formater les ateliers avec toutes leurs informations
          const ateliersFormatted = ateliers.map((ac) => ({
            uid: ac.atelier.uid,
            label: ac.atelier.label,
          }));

          return {
            uid: candidat.uid,
            codeCandidat: candidat.codeCandidat,
            firstname: candidat.firstname,
            lastname: candidat.lastname,
            email: candidat.email,
            dateBirth: candidat.dateBirth,
            appointment: candidat.appointment,
            consentement: candidat.consentement,
            createdAt: candidat.createdAt,
            updatedAt: candidat.updatedAt,
            filieres: filiereScores,
            workshop: ateliersFormatted,
          };
        }),
      );

      return candidatsEnrichis;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch candidats');
    }
  }

  /**
   * Crée un nouveau candidat dans la base de données
   * @async
   * @param {CreateCandidatDto} data - Données du candidat à créer
   * @param {string} data.email - Email du candidat (requis)
   * @param {string} data.firstname - Prénom du candidat (requis)
   * @param {string} data.lastname - Nom du candidat (requis)
   * @param {Date} data.dateBirth - Date de naissance du candidat (requis)
   * @param {boolean} [data.consentement] - Consentement pour le traitement des données personnelles
   * @returns {Promise<Candidat>} Le candidat créé
   * @throws {BadRequestException} Si les données requises manquent ou en cas d'erreur de création
   * @throws {ConflictException} Si un candidat avec cet email existe déjà
   *
   * @example
   * const newCandidat = await candidatsService.createCandidat({
   *   email: 'john.doe@example.com',
   *   firstname: 'John',
   *   lastname: 'Doe',
   *   dateBirth: new Date('1990-01-01'),
   *   consentement: true
   * });
   */
  async createCandidat(data: CreateCandidatDto): Promise<Candidat> {
    try {
      // Validation des données requises
      if (!data.email || !data.firstname || !data.lastname) {
        throw new BadRequestException(
          'Email, firstname, and lastname are required',
        );
      }

      // Si consentement est false, mettre les données personnelles à null
      const candidatData = {
        ...data,
        firstname: !data.consentement ? null : data.firstname,
        lastname: !data.consentement ? null : data.lastname,
        email: !data.consentement ? null : data.email,
        dateBirth: !data.consentement ? null : data.dateBirth,
      };

      return await this.prisma.candidat.create({
        data: candidatData,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Candidat with this email already exists`,
          );
        }
      }
      throw new BadRequestException('Failed to create candidat');
    }
  }

  /**
   * Met à jour un candidat existant
   * @async
   * @param {Object} params - Paramètres de mise à jour
   * @param {Prisma.CandidatWhereUniqueInput} params.where - Critère de recherche unique du candidat à mettre à jour
   * @param {Prisma.CandidatUpdateInput} params.data - Nouvelles données du candidat
   * @returns {Promise<Candidat>} Le candidat mis à jour
   * @throws {NotFoundException} Si le candidat n'existe pas
   * @throws {ConflictException} Si l'email est déjà utilisé par un autre candidat
   * @throws {BadRequestException} En cas d'erreur de mise à jour
   *
   * @example
   * const updatedCandidat = await candidatsService.updateCandidat({
   *   where: { uid: '123' },
   *   data: { firstname: 'Jane' }
   * });
   */
  async updateCandidat(params: {
    where: Prisma.CandidatWhereUniqueInput;
    data: Prisma.CandidatUpdateInput;
  }): Promise<Candidat> {
    try {
      const { where, data } = params;

      // Vérifier que le candidat existe
      const candidat = await this.prisma.candidat.findUnique({
        where,
      });

      if (!candidat) {
        throw new NotFoundException('Candidat not found');
      }

      return await this.prisma.candidat.update({
        data,
        where,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already in use');
        }
      }
      throw new BadRequestException('Failed to update candidat');
    }
  }

  /**
   * Supprime un candidat de la base de données
   * @async
   * @param {Prisma.CandidatWhereUniqueInput} where - Critère de recherche unique du candidat à supprimer
   * @returns {Promise<Candidat>} Les données du candidat supprimé
   * @throws {NotFoundException} Si le candidat n'existe pas
   * @throws {BadRequestException} En cas d'erreur de suppression
   *
   * @example
   * const deletedCandidat = await candidatsService.deleteCandidat({ uid: '123' });
   */
  async deleteCandidat(
    where: Prisma.CandidatWhereUniqueInput,
  ): Promise<Candidat> {
    try {
      // Vérifier que le candidat existe
      const candidat = await this.prisma.candidat.findUnique({
        where,
      });

      if (!candidat) {
        throw new NotFoundException('Candidat not found');
      }

      return await this.prisma.candidat.delete({
        where,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete candidat');
    }
  }
}
