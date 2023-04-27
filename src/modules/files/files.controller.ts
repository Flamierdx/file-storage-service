import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from './decorators/file';
import { FileEntity } from './entities/file';
import { IGetFilesQuery } from './types/get-files-query';
import { Response } from 'express';
import { RenameFileDto } from './dto/rename-file.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id';
import { DeleteFileType } from './types/delete-type';
import { parsePaginationQuery, parseSortQuery } from '../../shared/utils/parse-query';

@UseGuards(SessionAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadFile(@GetUserId() userId: string, @File() file: Express.Multer.File): Promise<FileEntity> {
    return this.filesService.create(userId, file);
  }

  @Get(':id/download')
  async downloadFile(@GetUserId() userId: string, @Param('id') fileId: string, @Res() res: Response): Promise<void> {
    await this.filesService.download(userId, fileId, res);
  }

  @Get(':id')
  async getOneFile(@GetUserId() userId: string, @Param('id') fileId: string): Promise<FileEntity> {
    return this.filesService.findOneOrThrow({ user: userId, _id: fileId });
  }

  @Get()
  async getManyFiles(@GetUserId() userId: string, @Query() query: IGetFilesQuery): Promise<FileEntity[]> {
    return this.filesService.findAll(userId, query.type, {
      ...parsePaginationQuery(query),
      ...parseSortQuery(query),
    });
  }

  @Delete(':id')
  async deleteFile(
    @GetUserId() userId: string,
    @Param('id') fileId: string,
    @Query('type') type: DeleteFileType,
  ): Promise<FileEntity> {
    return this.filesService.delete(userId, fileId, type);
  }

  @Put(':id/rename')
  async renameFile(
    @GetUserId() userId: string,
    @Param('id') fileId: string,
    @Body() renameFileDto: RenameFileDto,
  ): Promise<FileEntity> {
    return this.filesService.rename(userId, fileId, renameFileDto.filename);
  }
}
