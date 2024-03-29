import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { SessionSerializer } from '@modules/auth/serializers/session.serializer';
import { LocalStrategy } from '@modules/auth/strategies/local.strategy';
import { UsersModule } from '@modules/users';

@Module({
  imports: [UsersModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
