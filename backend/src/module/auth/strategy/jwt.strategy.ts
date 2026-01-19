import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from '../auth.module';
import { AdminsService } from '../../admins/admins.service';
import { ERROR } from '../../../common/constants/error.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private adminsService: AdminsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { adminUid: string }) {
    const admin = await this.adminsService.findOne(payload.adminUid);

    if (!admin) {
      throw new UnauthorizedException(ERROR.UnauthorizedAccess);
    }

    console.log('Admin trouvé dans la stratégie:', admin);

    return admin;
  }
}
