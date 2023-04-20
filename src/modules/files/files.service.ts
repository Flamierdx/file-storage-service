import { Inject, Injectable } from '@nestjs/common';
import { S3_STORAGE_SERVICE } from '../storage/constants';
import { IStorageService } from '../storage/services';
import { ICrudService } from '../../shared/types/crud-service.interface';
import { InjectModel } from '@nestjs/mongoose';
import { FileDocument, FileModel } from './entities/file';
import { Model } from 'mongoose';
import * as path from 'path';
import { IFindFilesParams } from './types/find-files-params';

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
    const uploadedFileStorageKey = await this.storageService.upload(binaryObjectName, binaryObject);

    const file = new this.file({
      name: filename,
      storageKey: uploadedFileStorageKey,
      mimetype: binaryObject.mimetype,
      extension: extension.slice(1),
      size: binaryObject.size,
    });

    return file.save();
  }

  delete(...args: unknown[]): unknown {
    return undefined;
  }

  findAll(params: IFindFilesParams): Promise<FileDocument[]> {
    return this.file
      .find({})
      .skip(params.skip || 0)
      .limit(params.limit || 0)
      .sort(params.sortValue && params.sortOrder ? { [params.sortValue]: params.sortOrder } : undefined)
      .exec();
  }

  findOne(...args: unknown[]): unknown {
    return undefined;
  }

  update(...args: unknown[]): unknown {
    return undefined;
  }
}
