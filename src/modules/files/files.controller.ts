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
import { FileDocument } from './entities/file';
import { IGetFilesQuery } from './types/get-files-query';
import { Response } from 'express';
import { RenameFileDto } from './dto/rename-file.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { GetUserId } from '../auth/decorators/get-user-id';
import { DeleteFileType } from './types/delete-type';

@UseGuards(SessionAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadFile(@GetUserId() userId: string, @File() file: Express.Multer.File): Promise<FileDocument> {
    return this.filesService.create(userId, file);
  }

  @Get(':id/download')
  async downloadFile(@GetUserId() userId: string, @Param('id') fileId: string, @Res() res: Response) {
    await this.filesService.download(userId, fileId, res);
  }

  @Get(':id')
  async getOneFile(@GetUserId() userId: string, @Param('id') fileId: string): Promise<FileDocument> {
    console.log(userId);
    return this.filesService.findOne(userId, fileId);
  }

  @Get()
  async getManyFiles(@GetUserId() userId: string, @Query() query: IGetFilesQuery): Promise<FileDocument[]> {
    return this.filesService.findAll(userId, query.type, {
      limit: query.limit ? parseInt(query.limit) : undefined,
      skip: query.offset ? parseInt(query.offset) : undefined,
      sortValue: query.sort ? (query.sort.split(',')[0] as any) : undefined,
      sortOrder: query.sort ? (query.sort.split(',')[1] as any) : undefined,
    });
  }

  @Delete(':id')
  async deleteFile(@GetUserId() userId: string, @Param('id') fileId: string, @Query('type') type: DeleteFileType) {
    return this.filesService.delete(userId, fileId, type);
  }

  @Put(':id/rename')
  async renameFile(
    @GetUserId() userId: string,
    @Param('id') fileId: string,
    @Body() renameFileDto: RenameFileDto,
  ): Promise<FileDocument> {
    return this.filesService.rename(userId, fileId, renameFileDto.filename);
  }
}
