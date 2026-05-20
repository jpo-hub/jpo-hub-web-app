import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilieresService } from './filieres.service';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';
import { FiliereModel } from '../../generated/prisma/models/Filiere';
import { SwaggerResponses } from '../../common/constants/swagger.constants';
import { FiliereEntity } from './entities/filiere.entity';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

@ApiTags('Filieres')
@Controller('filieres')
export class FilieresController {
  constructor(private readonly filieresService: FilieresService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une filière',
    description: 'Crée une nouvelle filière avec un label unique',
  })
  @ApiBody({ type: CreateFiliereDto })
  @ApiResponse(SwaggerResponses.Created('Filière', FiliereEntity))
  @ApiResponse(SwaggerResponses.NotFound('Filière'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createFiliereDto: CreateFiliereDto): Promise<FiliereModel> {
    return this.filieresService.create(createFiliereDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer toutes les filières',
    description: 'Retourne la liste de toutes les filières',
  })
  @ApiResponse(SwaggerResponses.Found('Filières', [FiliereEntity]))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findAll(): Promise<FiliereModel[]> {
    return this.filieresService.findAll();
  }

  @Get(':uid')
  @ApiOperation({
    summary: 'Récupérer une filière',
    description: 'Retourne une filière par son UID',
  })
  @ApiParam({ name: 'uid', description: 'UID de la filière' })
  @ApiResponse(SwaggerResponses.Found('Filière', FiliereEntity))
  @ApiResponse(SwaggerResponses.NotFound('Filière'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  async findOne(@Param('uid') uid: string): Promise<FiliereModel> {
    const filiere = await this.filieresService.findOne(uid);
    if (!filiere) {
      throw new NotFoundException(`Filière avec l'UID ${uid} non trouvée`);
    }
    return filiere;
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Mettre à jour une filière',
    description: "Met à jour le label d'une filière existante",
  })
  @ApiParam({ name: 'uid', description: 'UID de la filière' })
  @ApiBody({ type: UpdateFiliereDto })
  @ApiResponse(SwaggerResponses.Updated('Filière', FiliereEntity))
  @ApiResponse(SwaggerResponses.NotFound('Filière'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('uid') uid: string,
    @Body() updateFiliereDto: UpdateFiliereDto,
  ): Promise<FiliereModel> {
    return this.filieresService.update(uid, updateFiliereDto);
  }

  @Delete(':uid')
  @ApiOperation({
    summary: 'Supprimer une filière',
    description: 'Supprime une filière par son UID',
  })
  @ApiParam({ name: 'uid', description: 'UID de la filière' })
  @ApiResponse(SwaggerResponses.Deleted('Filière'))
  @ApiResponse(SwaggerResponses.NotFound('Filière'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('uid') uid: string): Promise<FiliereModel> {
    return this.filieresService.remove(uid);
  }
}
