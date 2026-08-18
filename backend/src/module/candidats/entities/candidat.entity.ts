import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsObject, IsString } from 'class-validator';

export class CandidatEntity {
  @ApiProperty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsNumber()
  codeCandidat: number;

  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  dateBirth: string;

  @ApiProperty()
  @IsBoolean()
  appointment: boolean;

  @ApiProperty()
  @IsBoolean()
  consentement: boolean;

  @ApiProperty({
    example: { informatique: 2, cybersecurite: 1 },
    description: "Mapping { 'LabelFiliere': score }",
  })
  @IsObject()
  filieres?: Record<string, number>;
}
