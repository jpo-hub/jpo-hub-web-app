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
import { CandidatsService } from './candidats.service';
import { CreateCandidatDto } from './dto/create-candidat.dto';
import { UpdateCandidatDto } from './dto/update-candidat.dto';
import { Candidat as CandidatModel } from '../../generated/prisma/models/Candidat';

@Controller('candidats')
export class CandidatsController {
  constructor(private readonly candidatsService: CandidatsService) {}

  @Post()
  async createCandidat(
    @Body() createCandidatDto: CreateCandidatDto,
  ): Promise<CandidatModel> {
    return this.candidatsService.createCandidat(createCandidatDto);
  }

  @Get()
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
  findOneByUid(@Param('uid') uid: string) {
    return this.candidatsService.candidat({ uid });
  }

  @Patch(':uid')
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
  remove(@Param('uid') uid: string) {
    return this.candidatsService.deleteCandidat({ uid: String(uid) });
  }
}
