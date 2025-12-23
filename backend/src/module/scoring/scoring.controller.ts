import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { SwaggerResponses } from '../../common/constants/swagger.constants';

@ApiTags('Scoring')
@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get(':candidatUid')
  @ApiOperation({
    summary: "Récupérer le scoring d'un candidat",
    description: 'Retourne le classement des filières pour un candidat donné',
  })
  @ApiParam({ name: 'candidatUid', description: 'UID du candidat' })
  @ApiResponse(SwaggerResponses.Found('Scoring', Object))
  @ApiResponse(SwaggerResponses.NotFound('Candidat'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  async findByUserAndAtelier(@Param('candidatUid') uid: string) {
    return await this.scoringService.scoringCandidat({ uid });
  }
}
