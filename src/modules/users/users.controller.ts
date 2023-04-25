import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id';
import { UsersService } from './users.service';

@UseGuards(SessionAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  async getMe(@GetUserId() userId: string) {
    return this.usersService.findOne({ _id: userId });
  }
}
