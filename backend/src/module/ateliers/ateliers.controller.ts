import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AteliersService } from './ateliers.service';
import { CreateAtelierDto } from './dto/create-atelier.dto';
import { UpdateAtelierDto } from './dto/update-atelier.dto';

@Controller('ateliers')
export class AteliersController {
  constructor(private readonly ateliersService: AteliersService) {}

  @Post()
  create(@Body() createAtelierDto: CreateAtelierDto) {
    return this.ateliersService.create(createAtelierDto);
  }

  @Get()
  findAll() {
    return this.ateliersService.findAll();
  }

  @Get(':uid')
  findOne(@Param('uid') id: string) {
    return this.ateliersService.findOne(id);
  }

  @Patch(':uid')
  update(
    @Param('uid') uid: string,
    @Body() updateAtelierDto: UpdateAtelierDto,
  ) {
    return this.ateliersService.update(uid, updateAtelierDto);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.ateliersService.remove(uid);
  }
}
