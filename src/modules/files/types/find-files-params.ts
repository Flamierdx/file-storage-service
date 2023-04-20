export interface IFindFilesParams {
  limit?: number;
  skip?: number;
  sortValue?: 'size' | 'name' | 'extension';
  sortOrder?: 'asc' | 'desc';
}
