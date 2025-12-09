import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidatDto {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly firstname: string;

  @ApiProperty()
  readonly lastname: string;

  @ApiProperty({ default: false })
  readonly appointment: boolean;

  @ApiProperty({ default: false })
  readonly consentement: boolean;

  @ApiProperty()
  readonly dateBirth: Date;
}
