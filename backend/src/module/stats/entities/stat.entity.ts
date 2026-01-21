import { ApiProperty } from '@nestjs/swagger';

export class StatEntity {
  @ApiProperty()
  filieres: Record<string, number>;
}
