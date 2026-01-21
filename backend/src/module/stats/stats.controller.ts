import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SwaggerResponses } from '../../common/constants/swagger.constants';
import { StatEntity } from './entities/stat.entity';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({
    summary: 'Récupérer les statistiques des filières',
    description: 'Retourne le nombre de sélections par filière.',
  })
  @ApiResponse(SwaggerResponses.Found('Stats', StatEntity))
  @ApiResponse(SwaggerResponses.NotFound('Stats'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findAll() {
    return this.statsService.findAll();
  }
}
