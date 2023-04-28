import { applyDecorators, Get } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SwaggerUserEntity } from '../entities/user';

export const ApiGetMe = (path: string) =>
  applyDecorators(
    ApiInternalServerErrorResponse(),
    ApiNotFoundResponse({ description: 'User has not found' }),
    ApiForbiddenResponse({ description: 'User has not authenticated' }),
    ApiOkResponse({ type: SwaggerUserEntity }),
    Get(path),
  );
