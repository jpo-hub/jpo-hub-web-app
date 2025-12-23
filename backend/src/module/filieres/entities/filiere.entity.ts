import { ApiProperty } from '@nestjs/swagger';

export class FiliereEntity {
  @ApiProperty()
  readonly label: string;
}
