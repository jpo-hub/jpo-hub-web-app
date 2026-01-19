import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Admin } from './entities/admin.entity';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

@Controller('admins')
@ApiTags('Admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @ApiCreatedResponse({ type: Admin })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Admin })
  findAll() {
    return this.adminsService.findAll();
  }

  @Get(':uid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Admin })
  findOne(@Param('uid') uid: string) {
    return this.adminsService.findOne(uid);
  }

  @Patch(':uid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Admin })
  update(@Param('uid') uid: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(uid, updateAdminDto);
  }

  @Delete(':uid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Admin })
  remove(@Param('uid') uid: string) {
    return this.adminsService.remove(uid);
  }
}
