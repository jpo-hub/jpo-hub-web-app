import { ApiProperty } from '@nestjs/swagger';

export class StatEntity {
  @ApiProperty()
  filieres: Record<string, number>;

  @ApiProperty({
    description: 'Nombre total d’ateliers actifs (non draft)',
    example: 12,
  })
  ateliersActifs: number;

  @ApiProperty({
    description: 'Nombre total de candidats ayant un rendez-vous',
    example: 4,
  })
  appointment: number;

  @ApiProperty({
    description: 'Nombre total de candidats',
    example: 12,
  })
  candidats: number;

  @ApiProperty({
    description: 'Top 3 des ateliers les plus populaires',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        uid: { type: 'string' },
        label: { type: 'string' },
        candidatsCount: { type: 'number' },
      },
    },
  })
  topAteliers: Array<{
    uid: string;
    label: string;
    candidatsCount: number;
  }>;
}
