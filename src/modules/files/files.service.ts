import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { S3_STORAGE_SERVICE } from '../storage/constants';
import { IStorageService } from '../storage/services';
import { ICrudService } from '../../shared/types/crud-service.interface';
import { InjectModel } from '@nestjs/mongoose';
import { FileDocument, FileModel } from './entities/file';
import { Model } from 'mongoose';
import * as path from 'path';
import { IFindFilesParams } from './types/find-files-params';
import { Response } from 'express';

@Injectable()
export class FilesService implements ICrudService {
  constructor(
    @Inject(S3_STORAGE_SERVICE) private readonly storageService: IStorageService,
    @InjectModel(FileModel.name) private readonly file: Model<FileModel>,
  ) {}

  async create(binaryObject: Express.Multer.File): Promise<FileDocument> {
    const binaryObjectName = Buffer.from(binaryObject.originalname, 'latin1').toString('utf-8');
    const extension = path.extname(binaryObjectName);
    const filename = path.basename(binaryObjectName, extension);
    let file = await this.file.findOne({ name: filename }).exec();

    if (file) {
      throw new ConflictException('File has already uploaded.');
    }

    const uploadedFileStorageKey = await this.storageService.upload(binaryObjectName, binaryObject);

    file = new this.file({
      name: filename,
      storageKey: uploadedFileStorageKey,
      mimetype: binaryObject.mimetype,
      extension: extension.slice(1),
      size: binaryObject.size,
    });

    return file.save();
  }

  async download(id: string, res: Response): Promise<void> {
    const file = await this.findOne(id);

    await this.storageService.download(file, res);
  }

  async delete(id: string): Promise<void> {
    const file = await this.findOne(id);
    await this.storageService.delete(file.storageKey);
    await this.file.deleteOne({ _id: id }).exec();
  }

  async findAll(params: IFindFilesParams): Promise<FileDocument[]> {
    return this.file
      .find({})
      .skip(params.skip || 0)
      .limit(params.limit || 0)
      .sort(params.sortValue && params.sortOrder ? { [params.sortValue]: params.sortOrder } : undefined)
      .exec();
  }

  async findOne(id: string): Promise<FileDocument> {
    const file = await this.file.findById(id).exec();
    if (!file) {
      throw new NotFoundException('File has not found.');
    }

    return file;
  }

  async rename(id: string, newFilename: string): Promise<FileDocument> {
    const file = await this.findOne(id);
    file.name = newFilename;
    return file.save();
  }

  update(...args: unknown[]): unknown {
    return undefined;
  }
}
