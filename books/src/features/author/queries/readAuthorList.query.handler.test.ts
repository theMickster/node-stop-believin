import { fakeAuthors } from '@fixtures/authors';

import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { isQueryOk, isQueryFail } from '@libs/cqrs/queryResult';

import { mapAuthorToReadAuthorDto } from '@data/mapping/authorMappers';
import { AuthorRepository } from '@data/repos/author.repository';

import { ReadAuthorListQueryHandler } from './readAuthorList.query.handler';


jest.mock('@data/repos/author.repository');

describe('ReadAuthorListQueryHandler', () => {
  let mockAuthorRepository: jest.Mocked<AuthorRepository>;
  let sut: ReadAuthorListQueryHandler;
  beforeEach(() => {
    mockAuthorRepository = {
      getAll: jest.fn(),
    } as unknown as jest.Mocked<AuthorRepository>;

    sut = new ReadAuthorListQueryHandler(mockAuthorRepository);
  });

  it('should return authors when repository result is successful', async () => {
    mockAuthorRepository.getAll.mockResolvedValue({
      success: true,
      data: fakeAuthors,
      statusCode: 0,
    });

    const result = await sut.handle({});

    expect(isQueryOk(result)).toBe(true);
    if (isQueryOk(result)) {
      const expectedDtos = fakeAuthors.map(mapAuthorToReadAuthorDto);
      expect(result.data).toEqual(expectedDtos);
    }
    expect(mockAuthorRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array if result is success but no data', async () => {
    mockAuthorRepository.getAll.mockResolvedValue({
      success: true,
      data: [],
      statusCode: 0,
    });

    const result = await sut.handle({});

    expect(isQueryOk(result)).toBe(true);
    if (isQueryOk(result)) {
      expect(result.data).toEqual([]);
    }
    expect(mockAuthorRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('should return error when repository result is unsuccessful', async () => {
    mockAuthorRepository.getAll.mockResolvedValue({
      success: false,
      error: 'Database failure',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    const result = await sut.handle({});

    expect(isQueryFail(result)).toBe(true);
    if (isQueryFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Database failure');
      expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    expect(mockAuthorRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('should return generic error when repository result has no error message', async () => {
    mockAuthorRepository.getAll.mockResolvedValue({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    const result = await sut.handle({});

    expect(isQueryFail(result)).toBe(true);
    if (isQueryFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Failed to retrieve authors');
      expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
});
