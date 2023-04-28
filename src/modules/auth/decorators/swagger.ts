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
import { SwaggerUserEntity } from '../../users/entities/user';
import { RegisterDto } from '../dto/register.dto';
import { Message, MessageWithData } from '../../../shared/types/message';
import { LoginDto } from '../dto/login.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';

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
