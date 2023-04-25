export type GetFilesType = 'all' | 'bin';

export interface IGetFilesQuery {
  type: GetFilesType;
  limit?: string;
  offset?: string;
  sort?: string;
}
