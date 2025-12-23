import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class AnswerEntity {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly label: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  questionUid: string;

  @ApiProperty({ example: { informatique: 2, cybersecurite: 1 } })
  @IsObject()
  filieres?: Record<string, number>;
}
