import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from './decorators/file';
import { FileDocument } from './entities/file';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async upload(@File() file: Express.Multer.File): Promise<FileDocument> {
    return this.filesService.create(file);
  }
}
