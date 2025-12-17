import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({
    description:
      'Scores par filière. En multipart/form-data, envoyer une string JSON.',
    type: 'string',
    example: '{"informatique":0,"ia & data":0,"cybersécurité":0}',
  })
  @Transform(({ value }: TransformFnParams): unknown => {
    if (value !== null && typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  })
  @IsObject()
  filieres!: Record<string, number>;

  @ApiProperty({
    required: false,
    description:
      'UIDs des candidats à associer. En multipart/form-data, envoyer une string JSON ex: ["<UUID>"]',
    type: 'array',
    items: { type: 'string', format: 'uuid' },
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams): unknown => {
    if (Array.isArray(value)) return value; // cas rare: déjà un tableau
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  })
  @IsArray()
  @IsUUID('4', { each: true })
  candidats?: string[];
}
