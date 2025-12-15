import { Injectable } from '@nestjs/common';
import { CreateAtelierDto } from './dto/create-atelier.dto';
import { UpdateAtelierDto } from './dto/update-atelier.dto';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Express } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AteliersService {
  private readonly s3Client: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_S3_REGION'),
    });
  }

  async create(createAtelierDto: CreateAtelierDto, file: Express.Multer.File) {
    const bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    const region = this.configService.getOrThrow<string>('AWS_S3_REGION');

    const safeLabel = (createAtelierDto.label ?? 'atelier')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-');

    const s3Key = `ateliers/${Date.now()}-${safeLabel}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

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

  findAll() {
    return this.prisma.atelier.findMany();
  }

  findOne(id: string) {
    return this.prisma.atelier.findUniqueOrThrow({ where: { uid: id } });
  }

  update(id: string, updateAtelierDto: UpdateAtelierDto) {
    return `This action updates a #${id} atelier`;
  }

  remove(id: string) {
    return `This action removes a #${id} atelier`;
  }
}
