import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user';

@UseGuards(SessionAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  async getMe(@GetUserId() userId: string): Promise<UserEntity> {
    return this.usersService.findOneOrThrow({ _id: userId });
  }
}
