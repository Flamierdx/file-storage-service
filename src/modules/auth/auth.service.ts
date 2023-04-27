import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { UserEntity } from '../users/entities/user';

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
