import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  create(@Body() createAnswerDto: CreateAnswerDto) {
    return this.answersService.create(createAnswerDto);
  }

  @Get()
  findAll() {
    return this.answersService.findAll();
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.answersService.findOne(uid);
  }

  @Patch(':uid')
  update(@Param('uid') uid: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.answersService.update(uid, updateAnswerDto);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.answersService.remove(uid);
  }
}
