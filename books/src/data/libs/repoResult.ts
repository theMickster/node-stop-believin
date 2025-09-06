export interface RepoResult<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
  statusCode: number;
}

/**
 * Repository result for paginated queries
 * Contains both data items and total count for pagination metadata
 */
export interface PaginatedRepoResult<T> {
  success: boolean;
  data?: {
    items: T[];
    totalCount: number;
  } | null;
  error?: string | null;
  statusCode: number;
}

export const repoOk = <T>(data: T): RepoResult<T> => ({
  success: true,
  data,
  statusCode: 0,
});

export const repoFail = <T = never>(error: string, statusCode: number): RepoResult<T> => ({
  success: false,
  error,
  statusCode,
});

export const paginatedRepoOk = <T>(items: T[], totalCount: number): PaginatedRepoResult<T> => ({
  success: true,
  data: { items, totalCount },
  statusCode: 0,
});

export const paginatedRepoFail = <T = never>(error: string, statusCode: number): PaginatedRepoResult<T> => ({
  success: false,
  error,
  statusCode,
});
