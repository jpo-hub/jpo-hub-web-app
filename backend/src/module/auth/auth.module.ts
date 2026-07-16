import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AdminsModule } from '../admins/admins.module';

// Secret injecté par l'environnement (.env en dev, docker-compose en prod).
// Le fallback ne sert qu'à ne pas casser un poste de dev sans .env.
export const jwtSecret = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '1d' },
    }),
    AdminsModule,
  ],
})
export class AuthModule {}
