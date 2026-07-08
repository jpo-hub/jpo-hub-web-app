import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { AtelierDetailsDto } from './ateliers.service';
import { AteliersService } from './ateliers.service';
import { CreateAtelierDto } from './dto/create-atelier.dto';
import { UpdateAtelierDto } from './dto/update-atelier.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Express } from 'express';
import { memoryStorage } from 'multer';
import { AtelierModel } from '../../generated/prisma/models/Atelier';
import { SwaggerResponses } from '../../common/constants/swagger.constants';
import { AtelierEntity } from './entities/atelier.entity';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

@ApiTags('Ateliers')
@Controller('ateliers')
export class AteliersController {
  constructor(private readonly ateliersService: AteliersService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un atelier',
    description:
      'Crée un nouvel atelier avec une image obligatoire (JPEG, PNG, WEBP, max 5MB)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAtelierDto })
  @ApiResponse(SwaggerResponses.Created('Atelier', AtelierEntity))
  @ApiResponse(SwaggerResponses.NotFound('Ressource'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseInterceptors(FileInterceptor('imageUrl', { storage: memoryStorage() }))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(
    @Body() createAtelierDto: CreateAtelierDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({ fileType: 'image/(jpeg|png|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<AtelierDetailsDto> {
    return this.ateliersService.create(createAtelierDto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les ateliers',
    description: 'Retourne la liste paginée des ateliers avec leurs candidats',
  })
  @ApiResponse(SwaggerResponses.Found('Ateliers', [AtelierEntity]))
  @ApiResponse(SwaggerResponses.ErrorServer)
  async findAll(): Promise<AtelierDetailsDto[]> {
    return await this.ateliersService.findAll();
  }

  @Get('all')
  @ApiOperation({
    summary: 'Récupérer tous les ateliers',
    description: 'Retourne la liste paginée des ateliers avec leurs candidats',
  })
  @ApiResponse(SwaggerResponses.Found('Ateliers', [AtelierEntity]))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAllAteliers(): Promise<AtelierDetailsDto[]> {
    return await this.ateliersService.findAllAteliers();
  }

  @Get(':uid')
  @ApiOperation({
    summary: 'Récupérer un atelier',
    description: 'Retourne un atelier par son UID avec ses candidats',
  })
  @ApiParam({ name: 'uid', description: "UID de l'atelier" })
  @ApiResponse(SwaggerResponses.Found('Atelier', AtelierEntity))
  @ApiResponse(SwaggerResponses.NotFound('Atelier'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findOne(@Param('uid') uid: string): Promise<AtelierDetailsDto> {
    return this.ateliersService.findOne(uid);
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Mettre à jour un atelier',
    description:
      "Met à jour un atelier. L'image est optionnelle (JPEG/PNG, max 5MB)",
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'uid', description: "UID de l'atelier" })
  @ApiBody({ type: UpdateAtelierDto })
  @ApiResponse(SwaggerResponses.Updated('Atelier', AtelierEntity))
  @ApiResponse(SwaggerResponses.NotFound('Atelier'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseInterceptors(FileInterceptor('imageUrl', { storage: memoryStorage() }))
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('uid') uid: string,
    @Body() updateAtelierDto: UpdateAtelierDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({ fileType: 'image/(jpeg|png)' }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.ateliersService.update(uid, updateAtelierDto, file);
  }

  @Delete(':uid')
  @ApiOperation({
    summary: 'Supprimer un atelier',
    description: 'Supprime un atelier et ses associations avec les candidats',
  })
  @ApiParam({ name: 'uid', description: "UID de l'atelier" })
  @ApiResponse(SwaggerResponses.Deleted('Atelier'))
  @ApiResponse(SwaggerResponses.NotFound('Atelier'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('uid') uid: string): Promise<AtelierModel> {
    return await this.ateliersService.remove(uid);
  }
}
