import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAtelierDto {
  @ApiProperty()
  @IsString()
  readonly label: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The article media (file)',
    required: false,
  })
  imageUrl?: unknown;

  @ApiProperty({ default: false })
  @Transform(
    ({ value }: TransformFnParams): boolean =>
      value === true || value === 'true',
  )
  @IsBoolean()
  readonly draft: boolean;

  @ApiProperty()
  @IsString()
  readonly dockerfilelink: string;

  @ApiPropertyOptional({
    example: { informatique: 2, cybersecurite: 1 },
    description: "Mapping { 'LabelFiliere': score }",
  })
  @IsOptional()
  @IsObject()
  filieres?: Record<string, number>;
}
