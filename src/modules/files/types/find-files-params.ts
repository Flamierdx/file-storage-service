import { FileEntity } from '../entities/file';

export interface IFindFilesParams {
  limit: number;
  offset: number;
  sortValue?: keyof FileEntity;
  sortOrder?: 'asc' | 'desc';
}
