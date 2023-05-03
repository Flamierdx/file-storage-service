import { applyDecorators, Delete, Get, Post, Put, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { API_MESSAGES, ERROR_MESSAGES } from '@modules/files/constants';
import { RenameFileDto } from '@modules/files/dto';
import { SwaggerFileEntity } from '@modules/files/entities/file';
import { ApiFile, ApiFileResponse } from '@shared/decorators/api-file';

export const ApiUpload = (path: string) =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.UPLOAD_DESCRIPTION }),
    ApiConflictResponse({ description: ERROR_MESSAGES.ALREADY_UPLOADED }),
    ApiCreatedResponse({ type: SwaggerFileEntity }),
    ApiFile('file'),
    ApiConsumes('multipart/form-data'),
    UseInterceptors(FileInterceptor('file')),
    Post(path),
  );

export const ApiDownload = (path: string) =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.DOWNLOAD_DESCRIPTION }),
    ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
    ApiFileResponse('application/octet-stream'),
    ApiParam({ name: 'id', required: true }),
    Get(path),
  );

export const ApiGetFile = (path: string) =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.GET_FILE_DESCRIPTION }),
    ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
    ApiOkResponse({ type: SwaggerFileEntity }),
    ApiParam({ name: 'id', required: true }),
    Get(path),
  );

export const ApiGetFiles = () =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.GET_FILES_DESCRIPTION }),
    ApiBadRequestResponse({ description: ERROR_MESSAGES.INVALID_QUERY_PARAMETERS }),
    ApiOkResponse({ type: [SwaggerFileEntity] }),
    ApiQuery({ name: 'limit', type: Number, required: false }),
    ApiQuery({ name: 'offset', type: Number, required: false }),
    ApiQuery({ name: 'sort', example: '[field],[asc | desc]', required: false }),
    ApiQuery({ name: 'type', enum: ['all', 'bin'], required: true }),
    Get(),
  );

export const ApiDeleteFile = (path: string) =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.DELETE_FILE_DESCRIPTION }),
    ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
    ApiBadRequestResponse({ description: ERROR_MESSAGES.INVALID_DELETE_TYPE }),
    ApiOkResponse({ type: SwaggerFileEntity }),
    ApiParam({ name: 'id', required: true }),
    ApiQuery({ name: 'type', enum: ['soft', 'hard'], required: true }),
    Delete(path),
  );

export const ApiRenameFile = (path: string) =>
  applyDecorators(
    ApiOperation({ description: API_MESSAGES.RENAME_FILE_DESCRIPTION }),
    ApiNotFoundResponse({ description: ERROR_MESSAGES.NOT_FOUND }),
    ApiOkResponse({ type: SwaggerFileEntity }),
    ApiParam({ name: 'id', required: true }),
    ApiBody({ type: RenameFileDto }),
    Put(path),
  );
