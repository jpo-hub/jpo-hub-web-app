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
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as Record<string, number>;
      } catch {
        return value as unknown as Record<string, number>;
      }
    }
    return value as Record<string, number>;
  })
  @IsObject()
  filieres?: Record<string, number>;
}
