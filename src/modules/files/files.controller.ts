import { Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from './decorators/file';
import { FileDocument } from './entities/file';
import { IGetFilesQuery } from './types/get-files-query';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async upload(@File() file: Express.Multer.File): Promise<FileDocument> {
    return this.filesService.create(file);
  }

  async download() {}

  @Get()
  async getManyFiles(@Query() query: IGetFilesQuery): Promise<FileDocument[]> {
    return this.filesService.findAll({
      limit: query.limit ? parseInt(query.limit) : undefined,
      skip: query.offset ? parseInt(query.offset) : undefined,
      sortValue: query.sort ? (query.sort.split(',')[0] as any) : undefined,
      sortOrder: query.sort ? (query.sort.split(',')[1] as any) : undefined,
    });
  }
}
