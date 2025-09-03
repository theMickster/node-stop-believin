import { fakeAuthors } from '@fixtures/authors';

import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import { isQueryOk, isQueryFail } from '@libs/cqrs/queryResult';

import { Author } from '@data/entities/author.entity';
import { RepoResult } from '@data/libs/repoResult';
import { AuthorRepository } from '@data/repos/author.repository';

import { ReadAuthorQueryHandler } from './readAuthor.query.handler';

jest.mock('@data/repos/author.repository');

describe('ReadAuthorQueryHandler', () => {
  let mockAuthorRepository: jest.Mocked<AuthorRepository>;
  let sut: ReadAuthorQueryHandler;
  const query = { id: '5aa2872a-202c-4d19-9a04-74b4f638275e' };

  const successResult: RepoResult<Author> = {
    success: true,
    data: fakeAuthors[0],
    statusCode: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthorRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<AuthorRepository>;

    sut = new ReadAuthorQueryHandler(mockAuthorRepository);
  });

  it('should return an author if it exists', async () => {
    mockAuthorRepository.getById.mockResolvedValue(successResult);

    const result = await sut.handle(query);

    expect(mockAuthorRepository.getById).toHaveBeenCalledWith(query.id);
    expect(isQueryOk(result)).toBe(true);
    if (isQueryOk(result)) {
      expect(result.data?.id).toEqual('5aa2872a-202c-4d19-9a04-74b4f638275e');
      expect(result.data?.firstName).toEqual('Stephen');
      expect(result.data?.lastName).toEqual('King');
      expect(result.data?.displayName).toEqual('Stephen King');
    }
  });

  it('should return null if the author is not found', async () => {
    const notFoundResult: RepoResult<Author> = {
      success: false,
      data: null,
      error: 'Author not found',
      statusCode: 404,
    };
    mockAuthorRepository.getById.mockResolvedValue(notFoundResult);

    const result = await sut.handle(query);

    expect(isQueryOk(result)).toBe(true);
    if (isQueryOk(result)) {
      expect(result.data).toBeNull();
    }
    expect(mockAuthorRepository.getById).toHaveBeenCalledWith(query.id);
  });

  it('should return error if repository fails without message', async () => {
    mockAuthorRepository.getById.mockResolvedValue({ success: false, data: null, error: null, statusCode: 500 });

    const result = await sut.handle(query);

    expect(isQueryFail(result)).toBe(true);
    if (isQueryFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Failed to retrieve author');
      expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    expect(mockAuthorRepository.getById).toHaveBeenCalledWith(query.id);
  });
});
