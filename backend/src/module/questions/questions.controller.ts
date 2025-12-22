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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question as QuestionModel } from '../../generated/prisma/models/Question';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto): Promise<QuestionModel> {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<QuestionModel[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNum - 1) * limitNum;

    return this.questionsService.findAll({
      skip,
      take: limitNum,
    });
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string): Promise<QuestionModel> {
    return this.questionsService.findOne(uid);
  }

  @Patch(':uid')
  update(
    @Param('uid') uid: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(uid, updateQuestionDto);
  }

  @Delete(':uid')
  remove(@Param('id') uid: string) {
    return this.questionsService.remove(uid);
  }
}
