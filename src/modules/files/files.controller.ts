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

@UseGuards(SessionAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadFile(@File() file: Express.Multer.File): Promise<FileDocument> {
    return this.filesService.create(file);
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    await this.filesService.download(id, res);
  }

  @Get(':id')
  async getOneFile(@Param('id') id: string): Promise<FileDocument> {
    return this.filesService.findOne(id);
  }

  @Get()
  async getManyFiles(@Query() query: IGetFilesQuery): Promise<FileDocument[]> {
    return this.filesService.findAll({
      limit: query.limit ? parseInt(query.limit) : undefined,
      skip: query.offset ? parseInt(query.offset) : undefined,
      sortValue: query.sort ? (query.sort.split(',')[0] as any) : undefined,
      sortOrder: query.sort ? (query.sort.split(',')[1] as any) : undefined,
    });
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    await this.filesService.delete(id);
    return 200;
  }

  @Put(':id/rename')
  async renameFile(@Param('id') id: string, @Body() renameFileDto: RenameFileDto): Promise<FileDocument> {
    return this.filesService.rename(id, renameFileDto.filename);
  }
}
