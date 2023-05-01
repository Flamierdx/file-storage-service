import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FileEntity, FileSchema } from '@modules/files/entities/file';
import { FilesController } from '@modules/files/files.controller';
import { FilesService } from '@modules/files/files.service';
import { StorageModule } from '@modules/storage';

@Module({
  imports: [MongooseModule.forFeature([{ name: FileEntity.name, schema: FileSchema }]), StorageModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
