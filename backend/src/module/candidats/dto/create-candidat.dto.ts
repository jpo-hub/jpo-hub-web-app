import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateCandidatDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  readonly firstname: string;

  @ApiProperty()
  @IsString()
  readonly lastname: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  readonly appointment: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  readonly consentement: boolean;

  @ApiPropertyOptional({
    example: { informatique: 2, cybersecurite: 1 },
    description: "Mapping { 'LabelFiliere': score }",
  })
  @IsOptional()
  @IsObject()
  filieres?: Record<string, number>;

  @ApiProperty()
  @IsDateString()
  readonly dateBirth: string;
}
