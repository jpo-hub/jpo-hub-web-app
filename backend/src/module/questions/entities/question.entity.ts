import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class QuestionEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;
}
