import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { AnswersService, ResponseDto } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post('traitement/:CandidatUID/answer/:answerUID')
  traitementAnswer(
    @Param('CandidatUID') CandidatUID: string,
    @Param('answerUID') answerUID: string,
  ) {
    if (!CandidatUID || !answerUID) {
      throw new BadRequestException('CandidatUID and answerUID are required');
    }
    return this.answersService.traitementAnswer(CandidatUID, answerUID);
  }

  @Post()
  create(@Body() createAnswerDto: CreateAnswerDto): Promise<ResponseDto> {
    return this.answersService.create(createAnswerDto);
  }

  @Get()
  findAll(): Promise<ResponseDto[]> {
    return this.answersService.findAll();
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string): Promise<ResponseDto> {
    return this.answersService.findOne(uid);
  }

  @Patch(':uid')
  update(
    @Param('uid') uid: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ): Promise<ResponseDto> {
    return this.answersService.update(uid, updateAnswerDto);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string): Promise<ResponseDto> {
    return this.answersService.remove(uid);
  }
}
