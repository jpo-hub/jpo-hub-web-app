import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAtelierDto } from './dto/create-atelier.dto';
import { UpdateAtelierDto } from './dto/update-atelier.dto';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client, } from '@aws-sdk/client-s3';
import { PrismaService } from '../../prisma/prisma.service';
import { Atelier, Prisma } from '../../generated/prisma/client';
import { ERROR } from '../../common/constants/error.constants';

/**
 * DTO enrichi d'un atelier avec ses filières et candidats.
 */
export type AtelierDetailsDto = Atelier & {
  filiere: Record<string, number>;
  candidats: string[];
};

/**
 * Service de gestion des ateliers.
 *
 * @description
 * Gère les opérations CRUD sur les ateliers avec les fonctionnalités suivantes :
 * - Upload et gestion des images sur AWS S3.
 * - Association des ateliers avec des filières et des candidats.
 * - Suppression en cascade des images S3 lors de la mise à jour ou suppression.
 *
 * @class AteliersService
 */
@Injectable()
export class AteliersService {
  /**
   * Client AWS S3 pour la gestion des fichiers.
   * @private
   */
  private readonly s3Client: S3Client;

  /**
   * Nom du bucket S3.
   * @private
   */
  private readonly bucket: string;

  /**
   * Région AWS du bucket S3.
   * @private
   */
  private readonly region: string;

  /**
   * Préfixe URL public pour les objets S3.
   * @private
   */
  private readonly s3PublicPrefix: string;

  /**
   * Logger pour le service.
   * @private
   */
  private readonly logger = new Logger(AteliersService.name);

  /**
   * Crée une instance du service AteliersService.
   *
   * @param {ConfigService} configService - Service de configuration NestJS.
   * @param {PrismaService} prisma - Service Prisma pour l'accès à la base de données.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.region = this.configService.getOrThrow<string>('AWS_S3_REGION');

    this.s3Client = new S3Client({ region: this.region });
    this.s3PublicPrefix = `https://${this.bucket}.s3.${this.region}.amazonaws.com/`;
  }

  /**
   * Vérifie qu'une chaîne n'est pas vide.
   *
   * @private
   * @param {string} value - Valeur à vérifier.
   * @param {string} fieldName - Nom du champ pour le message d'erreur.
   * @throws {BadRequestException} Si la valeur est vide ou invalide.
   */
  private assertNonEmptyString(value: string, fieldName: string): void {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(ERROR.MissingFields);
    }
  }

  /**
   * Vérifie que le fichier est une image supportée (JPEG ou PNG).
   *
   * @private
   * @param {Express.Multer.File} file - Fichier à vérifier.
   * @throws {BadRequestException} Si le type de fichier n'est pas supporté ou si le fichier est vide.
   */
  private assertSupportedImage(file: Express.Multer.File): void {
    const allowed = new Set(['image/jpeg', 'image/png']);
    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException(ERROR.InvalidInputFormat);
    }
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(ERROR.InvalidInputFormat);
    }
  }

  /**
   * Nettoie et normalise le nom de base d'un fichier.
   *
   * @private
   * @param {string} originalName - Nom original du fichier.
   * @returns {string} Nom de base nettoyé (lowercase, caractères spéciaux remplacés).
   *
   * @example
   * sanitizeBaseName('Mon Image (1).jpeg') // 'mon-image-1'
   */
  private sanitizeBaseName(originalName: string): string {
    const base = originalName
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return base.length > 0 ? base : 'image';
  }

  /**
   * Construit l'URL publique S3 à partir d'une clé.
   *
   * @private
   * @param {string} key - Clé de l'objet S3.
   * @returns {string} URL publique complète.
   */
  private buildS3PublicUrl(key: string): string {
    return `${this.s3PublicPrefix}${key}`;
  }

  /**
   * Extrait la clé S3 d'une URL publique si elle appartient à notre bucket.
   *
   * @private
   * @param {string | null | undefined} url - URL à analyser.
   * @returns {string | null} Clé S3 ou null si l'URL n'appartient pas au bucket.
   */
  private tryGetS3KeyFromPublicUrl(
    url: string | null | undefined,
  ): string | null {
    if (!url) return null;
    if (!url.startsWith(this.s3PublicPrefix)) return null;
    const key = url.slice(this.s3PublicPrefix.length);
    return key.length > 0 ? key : null;
  }

  /**
   * Upload une image vers AWS S3.
   *
   * @private
   * @async
   * @param {Object} params - Paramètres d'upload.
   * @param {string} params.uid - UID pour nommer le fichier.
   * @param {Express.Multer.File} params.file - Fichier image à uploader.
   * @param {string} params.folder - Dossier de destination dans S3.
   * @returns {Promise<{ key: string; publicUrl: string; contentType: string }>} Informations sur le fichier uploadé.
   * @throws {BadRequestException} Si le fichier n'est pas une image valide.
   * @throws {InternalServerErrorException} Si l'upload vers S3 échoue.
   *
   * @example
   * const result = await this.uploadImageToS3({
   *   uid: 'atelier-123',
   *   file: uploadedFile,
   *   folder: 'ateliers'
   * });
   */
  private async uploadImageToS3(params: {
    uid: string;
    file: Express.Multer.File;
    folder: string;
  }): Promise<{ key: string; publicUrl: string; contentType: string }> {
    const { uid, file, folder } = params;

    this.assertSupportedImage(file);

    const baseName = this.sanitizeBaseName(file.originalname);
    const extension = file.mimetype === 'image/png' ? 'png' : 'jpg';
    const contentType =
      file.mimetype === 'image/png' ? 'image/png' : 'image/jpeg';

    const key = `${folder}/${uid}-${Date.now()}-${baseName}.${extension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    } catch {
      throw new InternalServerErrorException(ERROR.ConflictError);
    }

    return { key, publicUrl: this.buildS3PublicUrl(key), contentType };
  }

  /**
   * Supprime un objet S3 si l'URL appartient à notre bucket (best-effort).
   *
   * @private
   * @async
   * @param {string | null | undefined} imageUrl - URL de l'image à supprimer.
   * @returns {Promise<void>}
   *
   * @description
   * Cette méthode est "best-effort" : si la suppression échoue, un warning est loggé
   * mais aucune exception n'est levée.
   */
  private async deleteS3ObjectIfOwnedByUs(
    imageUrl: string | null | undefined,
  ): Promise<void> {
    const key = this.tryGetS3KeyFromPublicUrl(imageUrl);
    if (!key) return;

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (err) {
      this.logger.warn(
        `Impossible de supprimer l'ancien objet S3 (best-effort). key="${key}"`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  /**
   * Convertit une entité Atelier en DTO enrichi.
   *
   * @private
   * @param {Atelier & { Atelier_Filiere?: Array<...>; Atelier_Candidat?: Array<...> }} atelier - L'atelier avec ses relations.
   * @returns {AtelierDetailsDto} Le DTO avec :
   *   - `filiere`: objet `{ [label]: score }`
   *   - `candidats`: liste des UIDs des candidats
   */
  private toApiAtelier(
    atelier: {
      Atelier_Filiere?: Array<{ score: number; filiere: { label: string } }>;
      Atelier_Candidat?: Array<{ candidatId: string }>;
    } & Atelier,
  ): AtelierDetailsDto {
    const filiere: Record<string, number> = {};
    for (const af of atelier.Atelier_Filiere ?? []) {
      filiere[af.filiere.label] = af.score;
    }

    return {
      uid: atelier.uid,
      label: atelier.label,
      imageUrl: atelier.imageUrl,
      description: atelier.description,
      draft: atelier.draft,
      createAt: atelier.createAt,
      updateAt: atelier.updateAt,
      dockerfilelink: atelier.dockerfilelink,
      filiere,
      candidats: (atelier.Atelier_Candidat ?? []).map((ac) => ac.candidatId),
    };
  }

  // ----------------------------
  // Public API
  // ----------------------------

  /**
   * Crée un nouvel atelier avec une image.
   *
   * @async
   * @param {CreateAtelierDto} createAtelierDto - Données de création de l'atelier.
   * @param {Express.Multer.File} file - Image de l'atelier (obligatoire, JPEG/PNG, max 5MB).
   * @returns {Promise<AtelierDetailsDto>} L'atelier créé avec ses détails enrichis.
   * @throws {BadRequestException} Si l'image est manquante ou invalide.
   * @throws {InternalServerErrorException} Si l'upload S3 ou la création échoue.
   *
   * @example
   * const atelier = await ateliersService.create(
   *   { label: 'Atelier Docker', description: 'Introduction à Docker' },
   *   imageFile
   * );
   */
  async create(
    createAtelierDto: CreateAtelierDto,
    file: Express.Multer.File,
  ): Promise<AtelierDetailsDto> {
    try {
      if (!file) {
        throw new BadRequestException(ERROR.MissingFields);
      }

      const filiereEntries = createAtelierDto.filieres
        ? Object.entries(createAtelierDto.filieres)
        : null;

      // Run S3 upload and filiere lookup in parallel
      const [{ publicUrl }, filiereCreateData] = await Promise.all([
        this.uploadImageToS3({ uid: 'atelier', file, folder: 'ateliers' }),
        filiereEntries
          ? this.prisma.filiere
              .findMany({
                where: {
                  label: { in: filiereEntries.map(([label]) => label) },
                },
                select: { uid: true, label: true },
              })
              .then((filieres) => {
                const map = new Map(filieres.map((f) => [f.label, f.uid]));
                return filiereEntries.map(([label, score]) => ({
                  score,
                  filiereId: map.get(label)!,
                }));
              })
          : Promise.resolve(null),
      ]);

      const newAtelier = await this.prisma.atelier.create({
        data: {
          label: createAtelierDto.label,
          description: createAtelierDto.description,
          draft: createAtelierDto.draft,
          dockerfilelink: createAtelierDto.dockerfilelink,
          imageUrl: publicUrl,
          Atelier_Filiere: filiereCreateData
            ? { create: filiereCreateData }
            : undefined,
        },
        include: {
          Atelier_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
        },
      });

      return this.toApiAtelier(newAtelier);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            throw new BadRequestException(ERROR.AlreadyExists);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Récupère une liste paginée d'ateliers.
   *
   * @async
   * @returns {Promise<AtelierDetailsDto[]>} Liste des ateliers enrichis.
   * @throws {BadRequestException} Si les paramètres sont invalides.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const ateliers = await ateliersService.findAll({ take: 10 });
   */
  async findAll(): Promise<AtelierDetailsDto[]> {
    try {
      const ateliers = await this.prisma.atelier.findMany({
        include: {
          Atelier_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
          Atelier_Candidat: { select: { candidatId: true } },
        },
        where: { draft: false },
      });

      return ateliers.map((atelier) => this.toApiAtelier(atelier));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  async findAllAteliers(): Promise<AtelierDetailsDto[]> {
    try {
      const ateliers = await this.prisma.atelier.findMany({
        include: {
          Atelier_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
          Atelier_Candidat: { select: { candidatId: true } },
        },
      });

      return ateliers.map((atelier) => this.toApiAtelier(atelier));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }
  }

  /**
   * Récupère un atelier par son UID.
   *
   * @async
   * @param {string} id - L'UID de l'atelier.
   * @returns {Promise<AtelierDetailsDto>} L'atelier avec ses filières et candidats.
   * @throws {BadRequestException} Si l'UID est vide.
   * @throws {NotFoundException} Si l'atelier n'existe pas.
   * @throws {InternalServerErrorException} En cas d'erreur inattendue.
   *
   * @example
   * const atelier = await ateliersService.findOne('atelier-123');
   */
  async findOne(id: string): Promise<AtelierDetailsDto> {
    try {
      this.assertNonEmptyString(id, 'uid');

      const atelier = await this.prisma.atelier.findUniqueOrThrow({
        where: { uid: id },
        include: {
          Atelier_Filiere: {
            include: { filiere: { select: { label: true } } },
          },
          Atelier_Candidat: { select: { candidatId: true } },
        },
      });

      return this.toApiAtelier(atelier);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(ERROR.ResourceNotFound);
        }
        throw new BadRequestException(ERROR.InvalidInputFormat);
      }

      throw new NotFoundException(ERROR.ResourceNotFound);
    }
  }

  /**
   * Met à jour un atelier existant.
   *
   * @async
   * @param {string} uid - L'UID de l'atelier à mettre à jour.
   * @param {UpdateAtelierDto} updateAtelierDto - Données de mise à jour.
   * @param {Express.Multer.File} [file] - Nouvelle image (optionnelle, JPEG/PNG, max 5MB).
   * @returns {Promise<Atelier>} L'atelier mis à jour.
   * @throws {BadRequestException} Si l'UID est vide ou l'image invalide.
   * @throws {NotFoundException} Si l'atelier n'existe pas.
   * @throws {InternalServerErrorException} Si la mise à jour ou l'upload S3 échoue.
   *
   * @description
   * Si une nouvelle image est fournie :
   * 1. L'image est uploadée vers S3.
   * 2. L'atelier est mis à jour avec la nouvelle URL.
   * 3. L'ancienne image S3 est supprimée (best-effort).
   *
   * @example
   * const atelier = await ateliersService.update('atelier-123', { label: 'Nouveau nom' });
   */
  async update(
    uid: string,
    updateAtelierDto: UpdateAtelierDto,
    file?: Express.Multer.File,
  ): Promise<Atelier> {
    this.assertNonEmptyString(uid, 'uid');

    let existing: { imageUrl: string | null };
    try {
      existing = await this.prisma.atelier.findUniqueOrThrow({
        where: { uid },
        select: { imageUrl: true },
      });
    } catch {
      throw new NotFoundException(ERROR.ResourceNotFound);
    }

    let nextImageUrl: string | undefined;
    if (file) {
      const upload = await this.uploadImageToS3({
        uid,
        file,
        folder: 'ateliers',
      });
      nextImageUrl = upload.publicUrl;
    }

    const data: Prisma.AtelierUpdateInput = {
      ...(typeof updateAtelierDto.label === 'string'
        ? { label: updateAtelierDto.label }
        : {}),
      ...(typeof updateAtelierDto.description === 'string'
        ? { description: updateAtelierDto.description }
        : {}),
      ...(typeof updateAtelierDto.draft === 'boolean'
        ? { draft: updateAtelierDto.draft }
        : {}),
      ...(typeof updateAtelierDto.dockerfilelink === 'string'
        ? { dockerfilelink: updateAtelierDto.dockerfilelink }
        : {}),
      ...(nextImageUrl ? { imageUrl: nextImageUrl } : {}),
    };

    let updated: Atelier;
    try {
      updated = await this.prisma.atelier.update({
        where: { uid },
        data,
      });
    } catch (error) {
      if (nextImageUrl) await this.deleteS3ObjectIfOwnedByUs(nextImageUrl);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }

    if (nextImageUrl) {
      await this.deleteS3ObjectIfOwnedByUs(existing.imageUrl);
    }

    return updated;
  }

  /**
   * Supprime un atelier et son image S3 associée.
   *
   * @async
   * @returns {Promise<Atelier>} L'atelier supprimé.
   * @throws {BadRequestException} Si l'UID est vide.
   * @throws {NotFoundException} Si l'atelier n'existe pas.
   * @throws {InternalServerErrorException} Si la suppression échoue.
   *
   * @description
   * Cette méthode effectue les opérations suivantes :
   * 1. Vérifie que l'atelier existe.
   * 2. Supprime l'atelier de la base de données.
   * 3. Supprime l'image S3 associée (best-effort).
   *
   * @example
   * const deleted = await ateliersService.remove('atelier-123');
   * console.log(`Atelier "${deleted.label}" supprimé`);
   * @param uid
   */
  async remove(uid: string): Promise<Atelier> {
    const atelier = await this.findOne(uid);

    let deleted: Atelier;
    try {
      deleted = await this.prisma.$transaction(async (tx) => {
        await tx.atelier_Filiere.deleteMany({ where: { atelierId: uid } });
        await tx.atelier_Candidat.deleteMany({ where: { atelierId: uid } });
        return tx.atelier.delete({ where: { uid: uid } });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(ERROR.ResourceNotFound);
          case 'P2003':
            throw new BadRequestException(ERROR.ConflictError);
          default:
            throw new BadRequestException(ERROR.InvalidInputFormat);
        }
      }

      throw new InternalServerErrorException(ERROR.ConflictError);
    }

    await this.deleteS3ObjectIfOwnedByUs(atelier.imageUrl);
    return deleted;
  }
}
