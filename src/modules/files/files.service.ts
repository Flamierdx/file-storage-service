import * as path from 'path';

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Response } from 'express';
import { FilterQuery, Model, Types } from 'mongoose';

import { CreateFileDto } from '@modules/files/dto';
import { FileDocument, FileEntity } from '@modules/files/entities/file';
import { DeleteFileType, GetFilesType, IFindFilesParams } from '@modules/files/types';
import { S3_STORAGE_SERVICE } from '@modules/storage/constants';
import { IStorageService } from '@modules/storage/services';

@Injectable()
export class FilesService implements OnModuleInit {
  constructor(
    @Inject(S3_STORAGE_SERVICE) private readonly storageService: IStorageService,
    @InjectModel(FileEntity.name) private readonly file: Model<FileEntity>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async create(userId: string, fileData: CreateFileDto): Promise<FileDocument> {
    const { filename, storageKey, extension, mimetype, size } = fileData;

    const file = new this.file({
      name: filename,
      user: userId,
      mimetype,
      size,
      storageKey,
      extension,
    });

    return file.save();
  }

  async uploadFile(userId: string, binaryObject: Express.Multer.File): Promise<FileDocument> {
    const { extension, filename } = this.parseFilename(binaryObject.originalname);
    const { size, mimetype } = binaryObject;

    const file = await this.findOne({ user: userId, name: filename });

    if (file) {
      throw new ConflictException('File has already uploaded.');
    }

    const storageKey = await this.storageService.upload(userId, `${filename}${extension}`, binaryObject);

    return this.create(userId, { extension, filename, storageKey, mimetype, size });
  }

  async download(userId: string, fileId: string, res: Response): Promise<void> {
    const file = await this.findOneOrThrow({ user: userId, _id: fileId });

    await this.storageService.download(file, res);
  }

  async delete(userId: string, fileId: string, type: DeleteFileType): Promise<FileDocument> {
    const file = await this.findOneOrThrow({ user: userId, _id: fileId });

    switch (type) {
      case 'soft':
        return this.softDelete(file);
      case 'hard':
        return this.hardDelete(file);
      default:
        throw new BadRequestException('Invalid request type for delete operation.');
    }
  }

  async findAll(userId: string, type: GetFilesType, params: IFindFilesParams): Promise<FileDocument[]> {
    return this.file
      .find({ user: userId })
      .exists('deletedAt', type === 'bin')
      .skip(params.offset)
      .limit(params.limit)
      .sort(params.sortValue && params.sortOrder ? { [params.sortValue]: params.sortOrder } : undefined)
      .exec();
  }

  async findOne(by: FilterQuery<FileEntity>): Promise<FileDocument | null> {
    return this.file.findOne(by).exec();
  }

  async findOneOrThrow(by: FilterQuery<FileEntity>): Promise<FileDocument> {
    const file = await this.findOne(by);

    if (!file) {
      throw new NotFoundException('File has not found.');
    }

    return file;
  }

  async rename(userId: string, fileId: string, newFilename: string): Promise<FileDocument> {
    const file = await this.findOneOrThrow({ user: userId, _id: fileId });
    file.name = newFilename;
    return file.save();
  }

  private parseFilename(filename: string): { filename: string; extension: string } {
    const binaryObjectName = Buffer.from(filename, 'latin1').toString('utf-8');
    const extension = path.extname(binaryObjectName);
    const parsedFilename = path.basename(binaryObjectName, extension);

    return {
      filename: parsedFilename,
      extension,
    };
  }

  private async softDelete(file: FileDocument): Promise<FileDocument> {
    if (!file.deletedAt) {
      await this.moveFileToBin(file);
      await this.setClearTimeoutOrThrow(file._id);
    } else {
      await this.returnFileFromBin(file);
      await this.removeClearTimeout(file._id);
    }

    return this.findOneOrThrow({ _id: file._id });
  }

  private async moveFileToBin(file: FileDocument): Promise<void> {
    await this.file.updateOne({ _id: file._id }, { $set: { deletedAt: new Date() } }).exec();
  }

  private async returnFileFromBin(file: FileDocument): Promise<void> {
    await this.file.updateOne({ _id: file._id }, { $unset: { deletedAt: 1 } }).exec();
  }

  private async hardDelete(file: FileDocument): Promise<FileDocument> {
    await this.storageService.delete(file.storageKey);
    await this.file.deleteOne({ _id: file._id }).exec();
    return file;
  }

  private async setClearTimeoutOrThrow(id: Types.ObjectId | string): Promise<void> {
    const file = await this.findOneOrThrow({ _id: id });
    await this.setClearTimeout(file);
  }

  private async setClearTimeout(file: FileDocument): Promise<void> {
    if (!file.deletedAt) {
      throw new BadRequestException('File do not exist in thrash.');
    }

    const deleteDate = new Date(file.deletedAt);
    deleteDate.setDate(file.deletedAt.getDate() + 14);
    const deleteMs = +deleteDate - +file.deletedAt;

    const timeout = setTimeout(async () => await this.hardDelete(file), deleteMs);
    this.schedulerRegistry.addTimeout(`delete_${file._id}`, timeout);
  }

  private async removeClearTimeout(id: Types.ObjectId | string): Promise<void> {
    this.schedulerRegistry.deleteTimeout(`delete_${id}`);
  }

  async onModuleInit(): Promise<void> {
    const files = await this.file.find().exists('deletedAt', true).exec();

    files.forEach(file => {
      this.setClearTimeout(file);
    });
  }
}
