import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FileEntity, FileSchema } from './entities/file';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: FileEntity.name, schema: FileSchema }]), StorageModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
