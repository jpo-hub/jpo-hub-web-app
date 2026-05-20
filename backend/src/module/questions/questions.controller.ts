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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionModel } from '../../generated/prisma/models/Question';
import { SwaggerResponses } from '../../common/constants/swagger.constants';
import { QuestionEntity } from './entities/question.entity';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une question',
    description: 'Crée une nouvelle question avec un label',
  })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse(SwaggerResponses.Created('Question', QuestionEntity))
  @ApiResponse(SwaggerResponses.NotFound('Question'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createQuestionDto: CreateQuestionDto): Promise<QuestionModel> {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer toutes les questions',
    description: 'Retourne la liste des questions',
  })
  @ApiResponse(SwaggerResponses.Found('Questions', [QuestionEntity]))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findAll(): Promise<QuestionModel[]> {
    return this.questionsService.findAll();
  }

  @Get('all')
  @ApiOperation({
    summary: 'Récupérer toutes les questions',
    description: 'Retourne la liste des questions Draft ou non',
  })
  @ApiResponse(SwaggerResponses.Found('Questions', [QuestionEntity]))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAllQuestions(): Promise<QuestionModel[]> {
    return this.questionsService.findAllQuestions();
  }

  @Get(':uid')
  @ApiOperation({
    summary: 'Récupérer une question',
    description: 'Retourne une question par son UID',
  })
  @ApiParam({ name: 'uid', description: 'UID de la question' })
  @ApiResponse(SwaggerResponses.Found('Question', QuestionEntity))
  @ApiResponse(SwaggerResponses.NotFound('Question'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findOne(@Param('uid') uid: string): Promise<QuestionModel> {
    return this.questionsService.findOne(uid);
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Mettre à jour une question',
    description: "Met à jour le label d'une question existante",
  })
  @ApiParam({ name: 'uid', description: 'UID de la question' })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse(SwaggerResponses.Updated('Question', QuestionEntity))
  @ApiResponse(SwaggerResponses.NotFound('Question'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('uid') uid: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(uid, updateQuestionDto);
  }

  @Delete(':uid')
  @ApiOperation({
    summary: 'Supprimer une question',
    description: 'Supprime une question et ses réponses associées',
  })
  @ApiParam({ name: 'uid', description: 'UID de la question' })
  @ApiResponse(SwaggerResponses.Deleted('Question'))
  @ApiResponse(SwaggerResponses.NotFound('Question'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('uid') uid: string) {
    return this.questionsService.remove(uid);
  }
}
