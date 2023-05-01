import { ConflictException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import { RegisterDto } from '@modules/auth/dto';
import { UserEntity } from '@modules/users/entities/user';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto): Promise<UserEntity> {
    const user = await this.usersService.findOne({ email: dto.email });

    if (user) {
      throw new ConflictException('User has been already registered.');
    }

    return this.usersService.create({ email: dto.email, hash: await argon2.hash(dto.password) });
  }
}
