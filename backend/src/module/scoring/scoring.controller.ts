import { Controller, Get, Param } from '@nestjs/common';
import { ScoringService } from './scoring.service';

@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get('candidat/:userId/atelier/:atelierId')
  findByUserAndAtelier(
    @Param('userId') userId: string,
    @Param('atelierId') atelierId: string,
  ) {
    return { userId: Number(userId), atelierId: Number(atelierId) };
  }
}
