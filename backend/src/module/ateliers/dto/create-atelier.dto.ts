import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

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
  imageUrl?: any;

  @ApiProperty({ default: false })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  readonly draft: boolean;

  @ApiProperty()
  @IsString()
  readonly dockerfilelink: string;
}
