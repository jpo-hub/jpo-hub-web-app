import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Admin {
  constructor(partial: Partial<Admin>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['admin', 'superadmin'] })
  role: string;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @Exclude()
  password: string;
}
