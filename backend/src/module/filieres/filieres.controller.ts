import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { FilieresService } from './filieres.service';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';
import { Filiere as FiliereModel } from '../../generated/prisma/models/Filiere';

@Controller('filieres')
export class FilieresController {
  constructor(private readonly filieresService: FilieresService) {}

  @Post()
  create(@Body() createFiliereDto: CreateFiliereDto): Promise<FiliereModel> {
    return this.filieresService.create(createFiliereDto);
  }

  @Get()
  findAll(): Promise<FiliereModel[]> {
    return this.filieresService.findAll();
  }

  @Get(':uid')
  async findOne(@Param('uid') uid: string): Promise<FiliereModel> {
    const filiere = await this.filieresService.findOne(uid);
    if (!filiere) {
      throw new NotFoundException(`Filière avec l'UID ${uid} non trouvée`);
    }
    return filiere;
  }

  @Patch(':uid')
  update(
    @Param('uid') uid: string,
    @Body() updateFiliereDto: UpdateFiliereDto,
  ): Promise<FiliereModel> {
    return this.filieresService.update(uid, updateFiliereDto);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string): Promise<FiliereModel> {
    return this.filieresService.remove(uid);
  }
}
