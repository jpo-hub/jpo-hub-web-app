import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthEntity } from './entity/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ERROR } from '../../common/constants/error.constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const admin = await this.prisma.admin.findUnique({
      where: { email: email },
    });

    if (!admin) {
      throw new BadRequestException(ERROR.IncorrectCredentials);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new BadRequestException(ERROR.IncorrectCredentials);
    }

    return {
      accessToken: this.jwtService.sign({ userUid: admin.uid }),
    };
  }
}
