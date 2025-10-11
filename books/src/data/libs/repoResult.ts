export interface RepoResult<T> {
  success: boolean;
  data?: T | null;
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
