import { FileEntity } from '../../files/entities/file';
import { Response } from 'express';

export interface IStorageService {
  upload(filename: string, file: Express.Multer.File): string | Promise<string>;
  download(file: FileEntity, res: Response): Promise<void>;
  delete(filename: string): Promise<void>;
}
