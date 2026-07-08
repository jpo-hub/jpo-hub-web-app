import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAtelierDto {
  @ApiProperty()
  @IsString()
  readonly label: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty({ default: false })
  @Transform(({ obj, key }: TransformFnParams): boolean => {
    const raw = (obj as Record<string, unknown>)[key];
    return raw === true || raw === 'true';
  })
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
