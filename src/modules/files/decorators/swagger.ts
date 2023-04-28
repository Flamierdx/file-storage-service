import { applyDecorators, Delete, Get, Post, Put, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SwaggerFileEntity } from '../entities/file';
import { ApiFile, ApiFileResponse } from '../../../shared/decorators/api-file';
import { FileInterceptor } from '@nestjs/platform-express';
import { RenameFileDto } from '../dto/rename-file.dto';

export const ApiUpload = (path: string) =>
  applyDecorators(
    ApiConflictResponse({ description: 'File has already uploaded.' }),
    ApiCreatedResponse({ type: SwaggerFileEntity }),
    ApiFile('file'),
    ApiConsumes('multipart/form-data'),
    UseInterceptors(FileInterceptor('file')),
    Post(path),
  );

export const ApiDownload = (path: string) =>
  applyDecorators(
    ApiNotFoundResponse({ description: 'File has not found.' }),
    ApiFileResponse('application/octet-stream'),
    ApiParam({ name: 'id', required: true }),
    Get(path),
  );

export const ApiGetFile = (path: string) =>
  applyDecorators(
    ApiNotFoundResponse({ description: 'File has not found.' }),
    ApiOkResponse({ type: SwaggerFileEntity }),
    ApiParam({ name: 'id', required: true }),
    Get(path),
  );

export const ApiGetFiles = () =>
  applyDecorators(
    ApiBadRequestResponse({ description: 'Invalid query parameters.' }),
    ApiOkResponse({ type: [SwaggerFileEntity] }),
    ApiQuery({ name: 'limit', type: Number, required: false }),
    ApiQuery({ name: 'offset', type: Number, required: false }),
    ApiQuery({ name: 'sort', example: '[field],[asc | desc]', required: false }),
    ApiQuery({ name: 'type', enum: ['all', 'bin'], required: true }),
    Get(),
  );

export const ApiDeleteFile = (path: string) =>
  applyDecorators(
    ApiNotFoundResponse({ description: 'File has not found.' }),
    ApiBadRequestResponse({ description: 'Invalid operation type.' }),
    ApiOkResponse({ type: SwaggerFileEntity }),
    ApiParam({ name: 'id', required: true }),
    ApiQuery({ name: 'type', enum: ['soft', 'hard'], required: true }),
    Delete(path),
  );

export const ApiRenameFile = (path: string) =>
  applyDecorators(
    ApiNotFoundResponse({ description: 'File has not found.' }),
    ApiOkResponse({ type: SwaggerFileEntity }),
    ApiParam({ name: 'id', required: true }),
    ApiBody({ type: RenameFileDto }),
    Put(path),
  );
