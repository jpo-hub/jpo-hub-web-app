import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class CreateCandidatDto {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly firstname: string;

  @ApiProperty()
  readonly lastname: string;

  @ApiProperty({ default: false })
  readonly appointment: boolean;

  @ApiProperty({ default: false })
  readonly consentement: boolean;

  @ApiPropertyOptional({
    example: { Informatique: 2, Cybersecurite: 1 },
    description: "Mapping { 'LabelFiliere': score }",
  })
  @IsOptional()
  @IsObject()
  filieres?: Record<string, number>;

  @ApiProperty()
  readonly dateBirth: Date;
}
