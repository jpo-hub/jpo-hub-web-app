import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, Filiere } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FiliereUpdateInput } from '../../generated/prisma/models/Filiere';
import { ERROR } from '../../common/constants/error.constants';

/**
 * Service de gestion des filières.
 *
 * @description
 * Gère les opérations CRUD sur les filières.
 * Les filières sont utilisées pour catégoriser les ateliers et calculer les scores des candidats.
 *
 * @class FilieresService
 */
@Injectable()
export class FilieresService {
  /**
   * Crée une instance du service FilieresService.
   *
   * @param {PrismaService} prisma - Service Prisma pour l'accès à la base de données.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une nouvelle filière.
   *
   * @async
   * @param {Prisma.FiliereCreateInput} data - Données de création de la filière.
   * @returns {Promise<Filiere>} La filière créée.
   * @throws {ConflictException} Si une filière avec ce label existe déjà.
   * @throws {BadRequestException} Si la création échoue.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const filiere = await filieresService.create({ label: 'Informatique' });
   */
  async create(data: Prisma.FiliereCreateInput): Promise<Filiere> {
    try {
      return await this.prisma.filiere.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new ConflictException(ERROR.AlreadyExists);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }
      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Récupère toutes les filières.
   *
   * @async
   * @returns {Promise<Filiere[]>} Liste de toutes les filières.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const filieres = await filieresService.findAll();
   * // [{ uid: '...', label: 'Informatique' }, { uid: '...', label: 'Marketing' }]
   */
  async findAll(): Promise<Filiere[]> {
    try {
      return await this.prisma.filiere.findMany();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }
      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Récupère une filière par son UID.
   *
   * @async
   * @param {string} uid - L'UID de la filière.
   * @returns {Promise<Filiere>} La filière trouvée.
   * @throws {NotFoundException} Si la filière n'existe pas.
   * @throws {BadRequestException} Si l'UID est invalide.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const filiere = await filieresService.findOne('fil-123');
   * // { uid: 'fil-123', label: 'Informatique' }
   */
  async findOne(uid: string): Promise<Filiere> {
    try {
      const filiere = await this.prisma.filiere.findUnique({
        where: { uid },
      });

      if (!filiere) {
        throw new NotFoundException(ERROR.ResourceNotFound);
      }

      return filiere;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Met à jour une filière existante.
   *
   * @async
   * @param {string} uid - L'UID de la filière à mettre à jour.
   * @param {FiliereUpdateInput} data - Données de mise à jour.
   * @returns {Promise<Filiere>} La filière mise à jour.
   * @throws {NotFoundException} Si la filière n'existe pas.
   * @throws {ConflictException} Si le nouveau label existe déjà.
   * @throws {BadRequestException} Si les données sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const filiere = await filieresService.update('fil-123', { label: 'Cybersécurité' });
   */
  async update(uid: string, data: FiliereUpdateInput): Promise<Filiere> {
    try {
      return await this.prisma.filiere.update({
        data,
        where: { uid },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          case 'P2002':
            throw new ConflictException(ERROR.AlreadyExists);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }
      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Supprime une filière.
   *
   * @async
   * @param {string} uid - L'UID de la filière à supprimer.
   * @returns {Promise<Filiere>} La filière supprimée.
   * @throws {NotFoundException} Si la filière n'existe pas.
   * @throws {ConflictException} Si la filière est encore utilisée par des ateliers ou candidats.
   * @throws {BadRequestException} Si la suppression échoue.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @description
   * La suppression échouera si la filière est référencée par :
   * - Des associations `Candidat_Filiere`
   * - Des associations `Atelier_Filiere`
   * - Des associations `Reponse_Filiere`
   *
   * @example
   * const deleted = await filieresService.remove('fil-123');
   * console.log(`Filière "${deleted.label}" supprimée`);
   */
  async remove(uid: string): Promise<Filiere> {
    try {
      return await this.prisma.filiere.delete({
        where: { uid },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          case 'P2003':
            throw new ConflictException(ERROR.ConflictError);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }
      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }
}
