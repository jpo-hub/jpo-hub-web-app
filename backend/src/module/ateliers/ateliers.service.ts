import { Injectable } from '@nestjs/common';
import { CreateAtelierDto } from './dto/create-atelier.dto';
import { UpdateAtelierDto } from './dto/update-atelier.dto';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaService } from '../../prisma/prisma.service';
import { Atelier, Prisma } from '../../generated/prisma/client';

@Injectable()
export class AteliersService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.region = this.configService.getOrThrow<string>('AWS_S3_REGION');

    this.s3Client = new S3Client({
      region: this.region,
    });
  }

  async create(
    createAtelierDto: CreateAtelierDto,
    file: Express.Multer.File,
  ): Promise<Atelier> {
    const s3Key = `ateliers/${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const publicUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${s3Key}`;

    return this.prisma.atelier.create({
      data: {
        label: createAtelierDto.label,
        description: createAtelierDto.description,
        draft: createAtelierDto.draft,
        dockerfilelink: createAtelierDto.dockerfilelink,
        imageUrl: publicUrl,
      },
    });
  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.AtelierWhereUniqueInput;
      where?: Prisma.AtelierWhereInput;
      orderBy?: Prisma.AtelierOrderByWithRelationInput;
    } = {},
  ) {
    const { skip, take, cursor, where, orderBy } = params;

    const ateliers = await this.prisma.atelier.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    const ateliersEnrichis = await Promise.all(
      ateliers.map(async (atelier) => {
        const liens = await this.prisma.atelier_Candidat.findMany({
          where: { atelierId: atelier.uid },
          select: {
            candidat: {
              select: {
                uid: true,
              },
            },
          },
        });

        return {
          ...atelier,
          candidats: liens.map((lien) => lien.candidat.uid),
        };
      }),
    );

    return ateliersEnrichis;
  }

  async findOne(id: string) {
    const atelier = await this.prisma.atelier.findUniqueOrThrow({
      where: { uid: id },
    });

    const liens = await this.prisma.atelier_Candidat.findMany({
      where: { atelierId: atelier.uid },
      select: {
        candidat: {
          select: {
            uid: true,
          },
        },
      },
    });

    return {
      ...atelier,
      candidats: liens.map((lien) => lien.candidat.uid),
    };
  }

  async update(
    uid: string,
    updateAtelierDto: UpdateAtelierDto,
  ): Promise<Atelier> {
    return this.prisma.atelier.update({
      data: updateAtelierDto,
      where: { uid: uid },
    });
  }

  async remove(id: string): Promise<Atelier> {
    return this.prisma.atelier.delete({ where: { uid: id } });
  }
}
