import { Response } from 'express';

import { FileEntity } from '@modules/files/entities/file';

export interface IStorageService {
  upload(userId: string, filename: string, file: Express.Multer.File): string | Promise<string>;
  download(file: FileEntity, res: Response): Promise<void>;
  delete(key: string): Promise<void>;
}
