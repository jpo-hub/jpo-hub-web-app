import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, Filiere } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FiliereUpdateInput } from '../../generated/prisma/models/Filiere';

@Injectable()
export class FilieresService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.FiliereCreateInput): Promise<Filiere> {
    try {
      return await this.prisma.filiere.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Une filière avec ce label existe déjà');
        }
      }
      throw new BadRequestException('Impossible de créer la filière');
    }
  }

  async findAll(): Promise<Filiere[]> {
    return this.prisma.filiere.findMany();
  }

  async findOne(uid: string): Promise<Filiere> {
    const filiere = await this.prisma.filiere.findUnique({
      where: { uid },
    });

    if (!filiere) {
      throw new NotFoundException(`Filière avec l'UID ${uid} non trouvée`);
    }

    return filiere;
  }

  async update(uid: string, data: FiliereUpdateInput): Promise<Filiere> {
    try {
      return await this.prisma.filiere.update({
        data,
        where: { uid },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Filière avec l'UID ${uid} non trouvée`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Une filière avec ce label existe déjà');
        }
      }
      throw new BadRequestException('Impossible de mettre à jour la filière');
    }
  }

  async remove(uid: string): Promise<Filiere> {
    try {
      return await this.prisma.filiere.delete({
        where: { uid },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Filière avec l'UID ${uid} non trouvée`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Impossible de supprimer cette filière car elle est utilisée par des ateliers ou candidats',
          );
        }
      }
      throw new BadRequestException('Impossible de supprimer la filière');
    }
  }
}
