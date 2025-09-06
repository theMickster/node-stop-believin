import { PaginationParams } from '@libs/types/pagination.types';
import { ValidatedSortConfig } from '@libs/types/sorting.types';

export class ReadAuthorListQuery {
  constructor(
    public readonly pagination: PaginationParams,
    public readonly sortConfig?: ValidatedSortConfig
  ) {}
}
