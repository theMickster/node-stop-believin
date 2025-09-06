import { PaginationParams } from '@libs/types/pagination.types';
import { ValidatedSortConfig } from '@libs/types/sorting.types';

export class ReadBookListQuery {
  constructor(
    public readonly pagination: PaginationParams,
    public readonly sortConfig?: ValidatedSortConfig
  ) {}
}
