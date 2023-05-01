import { Controller, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { GetUserId } from '@modules/auth/decorators';
import { SessionAuthGuard } from '@modules/auth/guards';
import { UsersService } from '@modules/users/users.service';

import { ApiGetMe } from './decorators/swagger';
import { UserEntity } from './entities/user';

@ApiCookieAuth()
@ApiTags('users')
@UseGuards(SessionAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiGetMe('/me')
  async getMe(@GetUserId() userId: string): Promise<UserEntity> {
    return this.usersService.findOneOrThrow({ _id: userId });
  }
}
