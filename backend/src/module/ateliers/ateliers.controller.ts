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
import { AtelierResponseDto } from './dto/atelier-response.dto';
import { UpdateAtelierDto } from './dto/update-atelier.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse } from '@nestjs/swagger';
import type { Express } from 'express';
import { memoryStorage } from 'multer';
import { AtelierModel } from '../../generated/prisma/models/Atelier';
import type { AtelierDetailsDto } from './ateliers.service';

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
  ): Promise<AtelierDetailsDto> {
    return this.ateliersService.create(createAtelierDto, file);
  }

  @Get()
  @ApiOkResponse({ type: AtelierResponseDto, isArray: true })
  async findAll(): Promise<AtelierDetailsDto[]> {
    return await this.ateliersService.findAll({});
  }

  @Get(':uid')
  @ApiOkResponse({ type: AtelierResponseDto })
  findOne(@Param('uid') uid: string): Promise<AtelierDetailsDto> {
    return this.ateliersService.findOne(uid);
  }

  @Patch(':uid')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imageUrl', { storage: memoryStorage() }))
  async update(
    @Param('uid') uid: string,
    @Body() updateAtelierDto: UpdateAtelierDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({ fileType: 'image/(jpeg|png)' }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.ateliersService.update(uid, updateAtelierDto, file);
  }

  @Delete(':uid')
  async remove(@Param('uid') uid: string): Promise<AtelierModel> {
    return await this.ateliersService.remove(uid);
  }
}
