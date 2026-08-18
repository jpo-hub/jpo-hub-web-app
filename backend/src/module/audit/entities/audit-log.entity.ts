import { ApiProperty } from '@nestjs/swagger';

export class AuditLog {
  constructor(partial: Partial<AuditLog>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  uid: string;

  @ApiProperty()
  table_name: string;

  @ApiProperty({ enum: ['INSERT', 'UPDATE', 'DELETE'] })
  operation: string;

  @ApiProperty()
  record_uid: string;

  @ApiProperty({ required: false, nullable: true })
  old_data: unknown;

  @ApiProperty({ required: false, nullable: true })
  new_data: unknown;

  @ApiProperty()
  db_user: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: "Email de l'admin authentifié, NULL pour une action publique",
  })
  app_user: string | null;

  @ApiProperty()
  logged_at: Date;
}
