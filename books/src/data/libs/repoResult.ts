export interface RepoResult<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
}

export const repoOk = <T>(data: T): RepoResult<T> => ({
  success: true,
  data,
});

export const repoFail = <T>(error: string): RepoResult<T> => ({
  success: false,
  error,
});
