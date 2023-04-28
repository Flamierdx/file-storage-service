import { Body, Controller, HttpStatus, Req, UseInterceptors } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { IMessage, IMessageWithData, Message, MessageWithData } from '../../shared/types/message';
import { UserEntity } from '../users/entities/user';
import { ApiInternalServerErrorResponse, ApiTags } from '@nestjs/swagger';
import { ApiLogin, ApiLogout, ApiRegister } from './decorators/swagger';

@ApiInternalServerErrorResponse()
@ApiTags('auth')
@UseInterceptors()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiRegister('/register')
  async register(@Body() dto: RegisterDto): Promise<UserEntity> {
    return this.authService.register(dto);
  }

  @ApiLogin('/login')
  async login(@Req() req: Request): Promise<IMessageWithData<{ id: string }>> {
    return new MessageWithData({ message: 'Logged in.', statusCode: HttpStatus.OK, data: req.user as { id: string } });
  }

  @ApiLogout('/logout')
  async logout(@Req() req: Request): Promise<IMessage> {
    req.session.destroy(err => {
      if (err) {
        console.error(err);
      }
    });

    return new Message({ statusCode: HttpStatus.OK, message: 'Logged out.' });
  }
}
