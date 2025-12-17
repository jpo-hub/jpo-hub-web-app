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
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { PrismaService } from '../../prisma/prisma.service';
import { Atelier, Prisma } from '../../generated/prisma/client';

type AtelierWithCandidateUids = Omit<Atelier, 'candidats'> & {
  candidats: string[];
};

@Injectable()
export class AteliersService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly s3PublicPrefix: string;

  private readonly logger = new Logger(AteliersService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.region = this.configService.getOrThrow<string>('AWS_S3_REGION');

    this.s3Client = new S3Client({ region: this.region });
    this.s3PublicPrefix = `https://${this.bucket}.s3.${this.region}.amazonaws.com/`;
  }

  private assertNonEmptyString(value: string, fieldName: string): void {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`${fieldName} est requis`);
    }
  }

  private assertSupportedImage(file: Express.Multer.File): void {
    const allowed = new Set(['image/jpeg', 'image/png']);
    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier non supporté (${file.mimetype}). Autorisés: jpg/jpeg, png.`,
      );
    }
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException(`Fichier image vide ou invalide`);
    }
  }

  private sanitizeBaseName(originalName: string): string {
    const base = originalName
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return base.length > 0 ? base : 'image';
  }

  private buildS3PublicUrl(key: string): string {
    return `${this.s3PublicPrefix}${key}`;
  }

  private tryGetS3KeyFromPublicUrl(
    url: string | null | undefined,
  ): string | null {
    if (!url) return null;
    if (!url.startsWith(this.s3PublicPrefix)) return null;
    const key = url.slice(this.s3PublicPrefix.length);
    return key.length > 0 ? key : null;
  }

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
      throw new InternalServerErrorException(
        `Échec de l'upload de l'image vers S3`,
      );
    }

    return { key, publicUrl: this.buildS3PublicUrl(key), contentType };
  }

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

  private async attachCandidateUidsToAteliers(
    ateliers: Atelier[],
  ): Promise<AtelierWithCandidateUids[]> {
    if (ateliers.length === 0) return [];

    const atelierIds = ateliers.map((a) => a.uid);

    const liens = await this.prisma.atelier_Candidat.findMany({
      where: { atelierId: { in: atelierIds } },
      select: {
        atelierId: true,
        candidat: { select: { uid: true } },
      },
    });

    const map = new Map<string, string[]>();
    for (const id of atelierIds) map.set(id, []);

    for (const lien of liens) {
      map.get(lien.atelierId)?.push(lien.candidat.uid);
    }

    return ateliers.map((atelier) => ({
      ...atelier,
      candidats: map.get(atelier.uid) ?? [],
    }));
  }

  private async attachCandidateUidsToAtelier(
    atelier: Atelier,
  ): Promise<AtelierWithCandidateUids> {
    const liens = await this.prisma.atelier_Candidat.findMany({
      where: { atelierId: atelier.uid },
      select: { candidat: { select: { uid: true } } },
    });

    return {
      ...atelier,
      candidats: liens.map((l) => l.candidat.uid),
    };
  }

  // ----------------------------
  // Public API
  // ----------------------------
  async create(
    createAtelierDto: CreateAtelierDto,
    file: Express.Multer.File,
  ): Promise<Atelier> {
    if (!file) {
      throw new BadRequestException(`image est requise`);
    }

    const { publicUrl } = await this.uploadImageToS3({
      uid: 'atelier',
      file,
      folder: 'ateliers',
    });

    try {
      return await this.prisma.atelier.create({
        data: {
          label: createAtelierDto.label,
          description: createAtelierDto.description,
          draft: createAtelierDto.draft,
          dockerfilelink: createAtelierDto.dockerfilelink,
          imageUrl: publicUrl,
        },
      });
    } catch {
      // Optionnel: si la DB échoue, tu peux supprimer l’image uploadée (rollback “best-effort”)
      await this.deleteS3ObjectIfOwnedByUs(publicUrl);
      throw new InternalServerErrorException(`Échec de création de l'atelier`);
    }
  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.AtelierWhereUniqueInput;
      where?: Prisma.AtelierWhereInput;
      orderBy?: Prisma.AtelierOrderByWithRelationInput;
    } = {},
  ): Promise<AtelierWithCandidateUids[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const ateliers = await this.prisma.atelier.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    return this.attachCandidateUidsToAteliers(ateliers);
  }

  async findOne(id: string): Promise<AtelierWithCandidateUids> {
    this.assertNonEmptyString(id, 'uid');

    let atelier: Atelier;
    try {
      atelier = await this.prisma.atelier.findUniqueOrThrow({
        where: { uid: id },
      });
    } catch {
      throw new NotFoundException(`Atelier introuvable`);
    }

    return this.attachCandidateUidsToAtelier(atelier);
  }

  async update(
    uid: string,
    updateAtelierDto: UpdateAtelierDto,
    file?: Express.Multer.File,
  ): Promise<Atelier> {
    this.assertNonEmptyString(uid, 'uid');

    // 1) vérifier existence + récupérer ancienne url
    let existing: { imageUrl: string | null };
    try {
      existing = await this.prisma.atelier.findUniqueOrThrow({
        where: { uid },
        select: { imageUrl: true },
      });
    } catch {
      throw new NotFoundException(`Atelier introuvable`);
    }

    // 2) upload nouvelle image si fournie
    let nextImageUrl: string | undefined;
    if (file) {
      const upload = await this.uploadImageToS3({
        uid,
        file,
        folder: 'ateliers',
      });
      nextImageUrl = upload.publicUrl;
    }

    // 3) update DB
    let updated: Atelier;
    try {
      updated = await this.prisma.atelier.update({
        where: { uid },
        data: {
          ...updateAtelierDto,
          ...(nextImageUrl ? { imageUrl: nextImageUrl } : {}),
        },
      });
    } catch {
      // Si upload OK mais update DB KO, on tente de nettoyer la nouvelle image
      if (nextImageUrl) await this.deleteS3ObjectIfOwnedByUs(nextImageUrl);
      throw new InternalServerErrorException(
        `Échec de mise à jour de l'atelier`,
      );
    }

    // 4) cleanup ancienne image (best-effort)
    if (nextImageUrl) {
      await this.deleteS3ObjectIfOwnedByUs(existing.imageUrl);
    }

    return updated;
  }

  async remove(id: string): Promise<Atelier> {
    this.assertNonEmptyString(id, 'uid');

    // On récupère d'abord l'imageUrl pour cleanup, puis delete DB
    let existing: { imageUrl: string | null };
    try {
      existing = await this.prisma.atelier.findUniqueOrThrow({
        where: { uid: id },
        select: { imageUrl: true },
      });
    } catch {
      throw new NotFoundException(`Atelier introuvable`);
    }

    let deleted: Atelier;
    try {
      deleted = await this.prisma.atelier.delete({ where: { uid: id } });
    } catch {
      throw new InternalServerErrorException(
        `Échec de suppression de l'atelier`,
      );
    }

    await this.deleteS3ObjectIfOwnedByUs(existing.imageUrl);
    return deleted;
  }
}
