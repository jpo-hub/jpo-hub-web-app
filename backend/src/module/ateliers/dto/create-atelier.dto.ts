import { ApiProperty } from '@nestjs/swagger';

export class CreateAtelierDto {
  @ApiProperty()
  readonly label: string;

  @ApiProperty()
  readonly description: string;

  @ApiProperty({ default: false })
  readonly draft: boolean;

  @ApiProperty()
  readonly dockerfilelink: string;
}
