import { applyDecorators, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { API_MESSAGES, ERROR_MESSAGES } from '@modules/auth/constants';
import { LoginDto, RegisterDto } from '@modules/auth/dto';
import { LocalAuthGuard } from '@modules/auth/guards';
import { SwaggerUserEntity } from '@modules/users/entities/user';
import { ERROR_MESSAGES as GLOBAL_ERROR_MESSAGES } from '@shared/constants';
import { Message } from '@shared/types/message';

export const ApiRegister = (path: string) =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.REGISTER_DESCRIPTION }),
    ApiCreatedResponse({ description: API_MESSAGES.REGISTER_SUCCESS, type: SwaggerUserEntity }),
    ApiBadRequestResponse({ description: GLOBAL_ERROR_MESSAGES.VALIDATION_ERROR }),
    ApiConflictResponse({ description: ERROR_MESSAGES.ALREADY_REGISTERED }),
    ApiBody({ type: RegisterDto }),
    Post(path),
  );

export const ApiLogin = (path: string) =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.LOGIN_DESCRIPTION }),
    ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
    ApiUnauthorizedResponse({ description: GLOBAL_ERROR_MESSAGES.INVALID_CREDENTIALS }),
    ApiOkResponse({ type: Message }),
    ApiBody({ type: LoginDto }),
    UseGuards(LocalAuthGuard),
    HttpCode(HttpStatus.OK),
    Post(path),
  );

export const ApiLogout = (path: string) =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.LOGOUT_DESCRIPTION }),
    ApiOkResponse({ type: Message }),
    ApiCookieAuth(),
    Get(path),
  );
