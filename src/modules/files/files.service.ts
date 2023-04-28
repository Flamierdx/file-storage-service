import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { S3_STORAGE_SERVICE } from '../storage/constants';
import { IStorageService } from '../storage/services';
import { InjectModel } from '@nestjs/mongoose';
import { FileDocument, FileEntity } from './entities/file';
import { FilterQuery, Model } from 'mongoose';
import * as path from 'path';
import { IFindFilesParams } from './types/find-files-params';
import { Response } from 'express';
import { DeleteFileType } from './types/delete-type';
import { GetFilesType } from './types/get-files-query';

@Injectable()
export class FilesService {
  constructor(
    @Inject(S3_STORAGE_SERVICE) private readonly storageService: IStorageService,
    @InjectModel(FileEntity.name) private readonly file: Model<FileEntity>,
  ) {}

  async create(userId: string, binaryObject: Express.Multer.File): Promise<FileDocument> {
    const { extension, filename } = this.parseFilename(binaryObject.originalname);
    let file = await this.findOne({ user: userId, name: filename });

    if (file) {
      throw new ConflictException('File has already uploaded.');
    }

    const uploadedFileStorageKey = await this.storageService.upload(userId, `${filename}${extension}`, binaryObject);

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
    if (file.deletedAt) {
      await this.moveFileToBin(file);
    } else {
      await this.returnFileFromBin(file);
    }

    return this.findOneOrThrow({ _id: file._id });
  }

  private async moveFileToBin(file: FileDocument): Promise<void> {
    await this.file.updateOne({ _id: file._id }, { $unset: { deletedAt: 1 } }).exec();
  }

  private async returnFileFromBin(file: FileDocument): Promise<void> {
    await this.file.updateOne({ _id: file._id }, { $set: { deletedAt: new Date() } }).exec();
  }

  private async hardDelete(file: FileDocument): Promise<FileDocument> {
    await this.storageService.delete(file.storageKey);
    await this.file.deleteOne({ _id: file._id }).exec();
    return file;
  }
}
