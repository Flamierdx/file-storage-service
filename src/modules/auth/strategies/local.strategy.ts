import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { UsersService } from '@modules/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(username: string, password: string): Promise<{ id: string }> {
    try {
      const user = await this.usersService.validateUser(username, password);
      return { id: user._id.toString() };
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new UnauthorizedException();
    }
  }
}
