import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AnswersService, ResponseDto } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { SwaggerResponses } from '../../common/constants/swagger.constants';
import { ERROR } from '../../common/constants/error.constants';
import { AnswerEntity } from './entities/answer.entity';
import { TraitementAnswerDto } from './dto/traitement-answer.dto';

@ApiTags('Answers')
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post('traitement/:CandidatUID')
  @ApiOperation({
    summary: 'Traiter les réponses pour un candidat',
    description: 'Additionne les scores des filières aux scores du candidat',
  })
  @ApiParam({ name: 'CandidatUID', description: 'UID du candidat' })
  @ApiResponse({
    status: 200,
    description: 'Scores mis à jour avec succès',
  })
  @ApiResponse(SwaggerResponses.NotFound('Candidat'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  traitementAnswer(
    @Param('CandidatUID') CandidatUID: string,
    @Body() Body: TraitementAnswerDto,
  ) {
    if (!CandidatUID) {
      throw new BadRequestException(ERROR.MissingFields);
    }
    return this.answersService.traitementAnswer(CandidatUID, Body);
  }

  @Post()
  @ApiOperation({
    summary: 'Créer une réponse',
    description: 'Crée une nouvelle réponse avec ses scores par filière',
  })
  @ApiBody({ type: CreateAnswerDto })
  @ApiResponse(SwaggerResponses.Created('Réponse', AnswerEntity))
  @ApiResponse(SwaggerResponses.NotFound('Question'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  create(@Body() createAnswerDto: CreateAnswerDto): Promise<ResponseDto> {
    return this.answersService.create(createAnswerDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer toutes les réponses',
    description: 'Retourne la liste de toutes les réponses avec leurs filières',
  })
  @ApiResponse(SwaggerResponses.Found('Réponses', [AnswerEntity]))
  @ApiResponse(SwaggerResponses.NotFound('Réponses'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findAll(): Promise<ResponseDto[]> {
    return this.answersService.findAll();
  }

  @Get(':uid')
  @ApiOperation({
    summary: 'Récupérer une réponse',
    description: 'Retourne une réponse par son UID',
  })
  @ApiParam({ name: 'uid', description: 'UID de la réponse' })
  @ApiResponse(SwaggerResponses.Found('Réponse', AnswerEntity))
  @ApiResponse(SwaggerResponses.NotFound('Réponse'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  findOne(@Param('uid') uid: string): Promise<ResponseDto> {
    return this.answersService.findOne(uid);
  }

  @Patch(':uid')
  @ApiOperation({
    summary: 'Mettre à jour une réponse',
    description: "Met à jour le label d'une réponse existante",
  })
  @ApiParam({ name: 'uid', description: 'UID de la réponse' })
  @ApiBody({ type: UpdateAnswerDto })
  @ApiResponse(SwaggerResponses.Updated('Réponse', AnswerEntity))
  @ApiResponse(SwaggerResponses.NotFound('Réponse'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  update(
    @Param('uid') uid: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ): Promise<ResponseDto> {
    return this.answersService.update(uid, updateAnswerDto);
  }

  @Delete(':uid')
  @ApiOperation({
    summary: 'Supprimer une réponse',
    description: 'Supprime une réponse et ses associations avec les filières',
  })
  @ApiParam({ name: 'uid', description: 'UID de la réponse' })
  @ApiResponse(SwaggerResponses.Deleted('Réponse'))
  @ApiResponse(SwaggerResponses.NotFound('Réponse'))
  @ApiResponse(SwaggerResponses.ErrorServer)
  remove(@Param('uid') uid: string): Promise<ResponseDto> {
    return this.answersService.remove(uid);
  }
}
