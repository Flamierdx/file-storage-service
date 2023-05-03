import { applyDecorators, Get } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { API_MESSAGES, ERROR_MESSAGES } from '@modules/users/constants';
import { SwaggerUserEntity } from '@modules/users/entities/user';

export const ApiGetMe = (path: string) =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.GET_ME_DESCRIPTION }),
    ApiInternalServerErrorResponse(),
    ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
    ApiForbiddenResponse({ description: ERROR_MESSAGES.NOT_AUTHENTICATED }),
    ApiOkResponse({ type: SwaggerUserEntity }),
    Get(path),
  );
