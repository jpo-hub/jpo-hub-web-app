import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { AteliersService } from './ateliers.service';
import { CreateAtelierDto } from './dto/create-atelier.dto';
import { UpdateAtelierDto } from './dto/update-atelier.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import type { Express } from 'express';
import { memoryStorage } from 'multer';

@Controller('ateliers')
export class AteliersController {
  constructor(private readonly ateliersService: AteliersService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imageUrl', { storage: memoryStorage() }))
  async create(
    @Body() createAtelierDto: CreateAtelierDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.ateliersService.create(createAtelierDto, file);
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
