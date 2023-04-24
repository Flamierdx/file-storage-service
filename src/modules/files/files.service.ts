import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { S3_STORAGE_SERVICE } from '../storage/constants';
import { IStorageService } from '../storage/services';
import { ICrudService } from '../../shared/types/crud-service.interface';
import { InjectModel } from '@nestjs/mongoose';
import { FileDocument, FileEntity } from './entities/file';
import { Model } from 'mongoose';
import * as path from 'path';
import { IFindFilesParams } from './types/find-files-params';
import { Response } from 'express';
import { UserEntity } from '../users/entities/user';

@Injectable()
export class FilesService implements ICrudService {
  constructor(
    @Inject(S3_STORAGE_SERVICE) private readonly storageService: IStorageService,
    @InjectModel(FileEntity.name) private readonly file: Model<FileEntity>,
  ) {}

  async create(userId: string, binaryObject: Express.Multer.File): Promise<FileDocument> {
    const binaryObjectName = Buffer.from(binaryObject.originalname, 'latin1').toString('utf-8');
    const extension = path.extname(binaryObjectName);
    const filename = path.basename(binaryObjectName, extension);
    let file = await this.file.findOne({ name: filename }).exec();

    if (file) {
      throw new ConflictException('File has already uploaded.');
    }

    const uploadedFileStorageKey = await this.storageService.upload(userId, binaryObjectName, binaryObject);

    file = new this.file({
      name: filename,
      storageKey: uploadedFileStorageKey,
      mimetype: binaryObject.mimetype,
      extension: extension.slice(1),
      size: binaryObject.size,
      user: userId,
    });

    return file.save();
  }

  async download(userId: string, fileId: string, res: Response): Promise<void> {
    const file = await this.findOne(userId, fileId);

    await this.storageService.download(file, res);
  }

  async delete(userId: string, fileId: string): Promise<void> {
    const file = await this.findOne(userId, fileId);

    await this.storageService.delete(file.storageKey);
    await this.file.deleteOne({ _id: fileId }).exec();
  }

  async findAll(userId: string, params: IFindFilesParams): Promise<FileDocument[]> {
    return this.file
      .find({ user: userId })
      .skip(params.skip || 0)
      .limit(params.limit || 0)
      .sort(params.sortValue && params.sortOrder ? { [params.sortValue]: params.sortOrder } : undefined)
      .exec();
  }

  async findOne(userId: string, fileId: string): Promise<FileDocument> {
    const file = await this.file.findById(fileId).populate('user', null, UserEntity.name).exec();

    if (!file) {
      throw new NotFoundException('File has not found.');
    }

    if (file.user._id.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to this file.');
    }

    return file;
  }

  async rename(userId: string, fileId: string, newFilename: string): Promise<FileDocument> {
    const file = await this.findOne(userId, fileId);

    file.name = newFilename;
    return file.save();
  }

  update(...args: unknown[]): unknown {
    throw new NotImplementedException();
  }
}
