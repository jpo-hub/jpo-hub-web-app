import { ApiProperty } from '@nestjs/swagger';

export class CreateFiliereDto {
  @ApiProperty()
  readonly label: string;
}
