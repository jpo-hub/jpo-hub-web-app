import { Controller, Get, Param } from '@nestjs/common';
import { ScoringService } from './scoring.service';

@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get(':candidatUid')
  async findByUserAndAtelier(@Param('candidatUid') uid: string) {
    return await this.scoringService.scoringCandidat({ uid });
  }
}
