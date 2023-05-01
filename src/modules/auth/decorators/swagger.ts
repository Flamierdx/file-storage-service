import { applyDecorators, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { LoginDto, RegisterDto } from '@modules/auth/dto';
import { LocalAuthGuard } from '@modules/auth/guards';
import { SwaggerUserEntity } from '@modules/users/entities/user';
import { Message, MessageWithData } from '@shared/types/message';

export const ApiRegister = (path: string) =>
  applyDecorators(
    ApiCreatedResponse({ description: 'User has registered successfully.', type: SwaggerUserEntity }),
    ApiBadRequestResponse({ description: 'Validation issues' }),
    ApiConflictResponse({ description: 'User has already registered.' }),
    ApiBody({ type: RegisterDto }),
    Post(path),
  );

export const ApiLogin = (path: string) =>
  applyDecorators(
    ApiNotFoundResponse({ description: 'User for login has not found.' }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials.' }),
    ApiOkResponse({ type: MessageWithData }),
    ApiBody({ type: LoginDto }),
    UseGuards(LocalAuthGuard),
    HttpCode(HttpStatus.OK),
    Post(path),
  );

export const ApiLogout = (path: string) =>
  applyDecorators(ApiOkResponse({ type: Message }), ApiCookieAuth(), Get(path));
