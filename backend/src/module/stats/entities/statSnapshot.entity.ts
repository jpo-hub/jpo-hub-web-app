import { ApiProperty } from '@nestjs/swagger';

export class StatSnapshotEntity {
  @ApiProperty()
  uid: string;

  @ApiProperty({
    description: 'Libellé du snapshot (ex: "JPO 2026-01")',
    example: 'JPO Janvier 2026',
  })
  label: string;

  @ApiProperty({
    description: 'Données statistiques complètes au moment du snapshot',
  })
  data: {
    filieres: Record<string, number>;
    ateliersActifs: number;
    appointment: number;
    candidats: number;
    topAteliers: Array<{
      uid: string;
      label: string;
      candidatsCount: number;
    }>;
  };

  @ApiProperty({
    description: 'Date et heure de création du snapshot',
    example: '2026-01-23T10:30:00.000Z',
  })
  timestamp: Date;
}
