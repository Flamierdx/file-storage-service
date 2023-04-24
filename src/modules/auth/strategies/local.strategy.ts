import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.validateUser(username, password);
      return { id: user._id.toString() };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
