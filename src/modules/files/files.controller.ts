import { Body, Controller, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { GetUserId } from '@modules/auth/decorators';
import { SessionAuthGuard } from '@modules/auth/guards';
import {
  ApiDeleteFile,
  ApiDownload,
  ApiGetFile,
  ApiGetFiles,
  ApiRenameFile,
  ApiUpload,
  File,
} from '@modules/files/decorators';
import { RenameFileDto } from '@modules/files/dto';
import { FileEntity } from '@modules/files/entities/file';
import { DeleteFileType, IGetFilesQuery } from '@modules/files/types';
import { parsePaginationQuery, parseSortQuery } from '@shared/utils/parse-query';

import { FilesService } from './files.service';

@ApiInternalServerErrorResponse()
@ApiCookieAuth()
@UseGuards(SessionAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiUpload('/upload')
  async uploadFile(@GetUserId() userId: string, @File() file: Express.Multer.File): Promise<FileEntity> {
    return this.filesService.uploadFile(userId, file);
  }

  @ApiDownload('/:id/download')
  async downloadFile(@GetUserId() userId: string, @Param('id') fileId: string, @Res() res: Response): Promise<void> {
    await this.filesService.download(userId, fileId, res);
  }

  @ApiGetFile('/:id')
  async getOneFile(@GetUserId() userId: string, @Param('id') fileId: string): Promise<FileEntity> {
    return this.filesService.findOneOrThrow({ user: userId, _id: fileId });
  }

  @ApiGetFiles()
  async getManyFiles(@GetUserId() userId: string, @Query() query: IGetFilesQuery): Promise<FileEntity[]> {
    return this.filesService.findAll(userId, query.type, {
      ...parsePaginationQuery(query),
      ...parseSortQuery(query),
    });
  }

  @ApiDeleteFile('/:id')
  async deleteFile(
    @GetUserId() userId: string,
    @Param('id') fileId: string,
    @Query('type') type: DeleteFileType,
  ): Promise<FileEntity> {
    return this.filesService.delete(userId, fileId, type);
  }

  @ApiRenameFile('/:id/rename')
  async renameFile(
    @GetUserId() userId: string,
    @Param('id') fileId: string,
    @Body() renameFileDto: RenameFileDto,
  ): Promise<FileEntity> {
    return this.filesService.rename(userId, fileId, renameFileDto.filename);
  }
}
