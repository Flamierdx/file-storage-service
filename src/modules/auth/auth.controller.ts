import { Body, Controller, Get, HttpStatus, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { Message, MessageWithData } from '../../shared/types/message';
import { UserEntity } from '../users/entities/user';

@UseInterceptors()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() dto: RegisterDto): Promise<UserEntity> {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request): Promise<MessageWithData<{ id: string }>> {
    return { message: 'Logged in.', statusCode: HttpStatus.OK, data: req.user as { id: string } };
  }

  @Get('/logout')
  async logout(@Req() req: Request): Promise<Message> {
    req.session.destroy(err => {
      if (err) {
        console.error(err);
      }
    });

    return { message: 'Logged out.', statusCode: 200 };
  }
}
