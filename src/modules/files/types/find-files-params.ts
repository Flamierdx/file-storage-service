import { FileEntity } from '@modules/files/entities/file';

export interface IFindFilesParams {
  limit: number;
  offset: number;
  sortValue?: keyof FileEntity;
  sortOrder?: 'asc' | 'desc';
}
