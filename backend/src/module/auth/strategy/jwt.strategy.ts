import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from '../auth.module';
import { AdminsService } from '../../admins/admins.service';
import { ERROR } from '../../../common/constants/error.constants';
import { auditContext } from '../../../common/audit/audit-context';

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

    // Rend l'admin identifiable par le journal d'audit PostgreSQL
    const store = auditContext.getStore();
    if (store) {
      store.email = admin.email;
    }

    return admin;
  }
}
