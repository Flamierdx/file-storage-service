import { Body, Controller, HttpStatus, Req, UseInterceptors } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from '@modules/auth/auth.service';
import { ApiLogin, ApiLogout, ApiRegister } from '@modules/auth/decorators';
import { RegisterDto } from '@modules/auth/dto';
import { UserEntity } from '@modules/users/entities/user';
import { IMessage, Message } from '@shared/types/message';

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
  async login(@Req() req: Request): Promise<IMessage<{ id: string }>> {
    return new Message({ message: 'Logged in.', statusCode: HttpStatus.OK, data: req.user as { id: string } });
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
