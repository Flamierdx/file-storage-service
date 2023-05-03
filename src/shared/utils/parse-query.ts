import { BadRequestException } from '@nestjs/common';

import { ObjectWith } from '@shared/types/object';

export type SortQuery<T> = { sortValue?: T; sortOrder?: 'asc' | 'desc' };
export type PaginationQuery = { limit: number; offset: number };

export const checkSortOrder = (order: string): order is 'asc' | 'desc' => {
  return order === 'asc' || order === 'desc';
};

export const parseSortQuery = <T>(query: ObjectWith<any>): SortQuery<T> => {
  const [sortValue, sortOrder] = query?.sort?.split(',') || [undefined, undefined];
  if (typeof sortOrder === 'string' && !checkSortOrder(sortOrder)) {
    throw new BadRequestException('Invalid sort query order.');
  }

  return { sortValue: sortValue as T, sortOrder };
};

export const parsePaginationQuery = (query: { [key: string]: any }): PaginationQuery => {
  return {
    limit: query.limit ? parseInt(query.limit) : 0,
    offset: query.offset ? parseInt(query.offset) : 0,
  };
};
