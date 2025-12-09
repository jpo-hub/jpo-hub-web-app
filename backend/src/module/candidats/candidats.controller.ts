import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  async findAll(): Promise<CandidatModel[]> {
    return this.candidatsService.candidats({});
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
