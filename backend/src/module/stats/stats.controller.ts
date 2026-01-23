import { Controller, Get, Post, Body } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SwaggerResponses } from '../../common/constants/swagger.constants';
import { StatEntity } from './entities/stat.entity';
import { StatSnapshotEntity } from './entities/statSnapshot.entity';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({
    summary: 'Récupérer les statistiques actuelles',
    description: 'Retourne les statistiques en temps réel.',
  })
  @ApiResponse(SwaggerResponses.Found('Stats', StatEntity))
  @ApiResponse(SwaggerResponses.NotFound('Stats'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findAll() {
    return this.statsService.findAll();
  }

  @Post('snapshot')
  @ApiOperation({
    summary: 'Créer un snapshot des statistiques',
    description: 'Sauvegarde les statistiques actuelles pour archivage.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          example: 'JPO Janvier 2026',
          description: 'Libellé du snapshot',
        },
      },
      required: ['label'],
    },
  })
  @ApiResponse(SwaggerResponses.Created('Snapshot', StatSnapshotEntity))
  @ApiResponse(SwaggerResponses.ErrorServer)
  makeSnapshot(@Body('label') label: string) {
    return this.statsService.makeSnapshot(label);
  }

  @Get('snapshots/last')
  @ApiOperation({
    summary: 'Récupérer le dernier snapshot',
    description: 'Retourne le snapshot le plus récent.',
  })
  @ApiResponse(SwaggerResponses.Found('Snapshot', StatSnapshotEntity))
  @ApiResponse(SwaggerResponses.NotFound('Snapshot'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findLastSnapshot() {
    return this.statsService.findLastSnapshot();
  }

  @Get('snapshots')
  @ApiOperation({
    summary: 'Récupérer tous les snapshots',
    description: 'Retourne tous les snapshots archivés.',
  })
  @ApiResponse(SwaggerResponses.Found('Snapshots', StatSnapshotEntity))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findAllSnapshots() {
    return this.statsService.findAllSnapshots();
  }
}
