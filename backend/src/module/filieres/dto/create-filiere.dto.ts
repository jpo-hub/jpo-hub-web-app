import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFiliereDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly label: string;
}
