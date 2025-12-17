import { ApiProperty } from '@nestjs/swagger';

export class AtelierResponseDto {
  @ApiProperty({ format: 'uuid' })
  uid!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  imageUrl!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  draft!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updateAt!: Date;

  @ApiProperty()
  dockerfilelink!: string;

  @ApiProperty({
    description: 'Scores par filière (clé=label)',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { Informatique: 8, 'IA & Data': 3, Cybersécurité: 4 },
  })
  filieres!: Record<string, number>;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    example: ['<UUID_CANDIDAT_1>'],
  })
  candidats!: string[];
}
