import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CandidatsService } from './candidats.service';
import { CreateCandidatDto } from './dto/create-candidat.dto';
import { UpdateCandidatDto } from './dto/update-candidat.dto';
import { SwaggerResponses } from '../../common/constants/swagger.constants';
import { CandidatEntity } from './entities/candidat.entity';

@ApiTags('Candidats')
@Controller('candidats')
export class CandidatsController {
  constructor(private readonly candidatsService: CandidatsService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un candidat',
    description:
      'Crée un nouveau candidat. Si consentement=false, les données personnelles sont anonymisées.',
  })
  @ApiBody({ type: CreateCandidatDto })
  @ApiResponse(SwaggerResponses.Created('Candidat', CandidatEntity))
  @ApiResponse(SwaggerResponses.NotFound('Filière'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  async createCandidat(@Body() createCandidatDto: CreateCandidatDto) {
    return this.candidatsService.createCandidat(createCandidatDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les candidats',
    description:
      'Retourne la liste paginée des candidats avec leurs filières et ateliers',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Numéro de page (défaut: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: "Nombre d'éléments par page (défaut: 10)",
    example: 10,
  })
  @ApiResponse(SwaggerResponses.Found('Candidats', [CandidatEntity]))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNum - 1) * limitNum;

    return this.candidatsService.candidats({
      skip,
      take: limitNum,
    });
  }

  @Get(':uid')
  @ApiOperation({
    summary: 'Récupérer un candidat',
    description:
      'Retourne un candidat par son UID avec ses filières et ateliers',
  })
  @ApiParam({ name: 'uid', description: 'UID du candidat' })
  @ApiResponse(SwaggerResponses.Found('Candidat', CandidatEntity))
  @ApiResponse(SwaggerResponses.NotFound('Candidat'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findOneByUid(@Param('uid') uid: string) {
    return this.candidatsService.candidat({ uid });
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Mettre à jour un candidat',
    description:
      'Met à jour un candidat. Si consentement=false, les données personnelles sont anonymisées.',
  })
  @ApiParam({ name: 'uid', description: 'UID du candidat' })
  @ApiBody({ type: UpdateCandidatDto })
  @ApiResponse(SwaggerResponses.Updated('Candidat', CandidatEntity))
  @ApiResponse(SwaggerResponses.NotFound('Candidat'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  updateByUid(
    @Param('uid') uid: string,
    @Body() updateCandidatDto: UpdateCandidatDto,
  ) {
    return this.candidatsService.updateCandidat({
      where: { uid },
      data: updateCandidatDto,
    });
  }

  @Delete(':uid')
  @ApiOperation({
    summary: 'Supprimer un candidat',
    description:
      'Supprime un candidat et toutes ses associations (filières, ateliers)',
  })
  @ApiParam({ name: 'uid', description: 'UID du candidat' })
  @ApiResponse(SwaggerResponses.Deleted('Candidat'))
  @ApiResponse(SwaggerResponses.NotFound('Candidat'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  remove(@Param('uid') uid: string) {
    return this.candidatsService.deleteCandidat({ uid: String(uid) });
  }
}
