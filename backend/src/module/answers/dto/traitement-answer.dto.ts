import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class TraitementAnswerDto {
  @ApiProperty({ example: { informatique: 2, cybersecurite: 1 } })
  @IsObject()
  filieres?: Record<string, number>;
}
