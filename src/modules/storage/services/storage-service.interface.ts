export interface IStorageService {
  upload(filename: string, file: Express.Multer.File): string | Promise<string>;
  download(filename: string): Buffer;
  delete(filename: string): void;
  rename(oldFilename: string, newFilename: string): void;
}
