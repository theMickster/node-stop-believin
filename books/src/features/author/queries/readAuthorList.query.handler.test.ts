import { fakeAuthors } from '@fixtures/authors';

import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { isQueryOk, isQueryFail } from '@libs/cqrs/queryResult';
import { PAGINATION_DEFAULTS } from '@libs/types/pagination.types';

import { mapAuthorToReadAuthorDto } from '@data/mapping/authorMappers';
import { AuthorRepository } from '@data/repos/author.repository';

import { ReadAuthorListQuery } from './readAuthorList.query';
import { ReadAuthorListQueryHandler } from './readAuthorList.query.handler';


jest.mock('@data/repos/author.repository');

describe('ReadAuthorListQueryHandler', () => {
  let mockAuthorRepository: jest.Mocked<AuthorRepository>;
  let sut: ReadAuthorListQueryHandler;
  beforeEach(() => {
    mockAuthorRepository = {
      getAllPaginated: jest.fn(),
    } as unknown as jest.Mocked<AuthorRepository>;

    sut = new ReadAuthorListQueryHandler(mockAuthorRepository);
  });

  it('should return authors when repository result is successful', async () => {
    const totalCount = 25;
    mockAuthorRepository.getAllPaginated.mockResolvedValue({
      success: true,
      data: { items: fakeAuthors, totalCount },
      statusCode: 0,
    });

    const pagination = { page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE };
    const query = new ReadAuthorListQuery(pagination);
    const result = await sut.handle(query);

    expect(isQueryOk(result)).toBe(true);
    if (isQueryOk(result)) {
      const expectedDtos = fakeAuthors.map(mapAuthorToReadAuthorDto);
      expect(result.data.data).toEqual(expectedDtos);
      expect(result.data.pagination).toEqual({
        page: 1,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / PAGINATION_DEFAULTS.PAGE_SIZE),
      });
    }
    expect(mockAuthorRepository.getAllPaginated).toHaveBeenCalledTimes(1);
    expect(mockAuthorRepository.getAllPaginated).toHaveBeenCalledWith(pagination, undefined);
  });

  it('should return empty array if result is success but no data', async () => {
    mockAuthorRepository.getAllPaginated.mockResolvedValue({
      success: true,
      data: { items: [], totalCount: 0 },
      statusCode: 0,
    });

    const pagination = { page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE };
    const query = new ReadAuthorListQuery(pagination);
    const result = await sut.handle(query);

    expect(isQueryOk(result)).toBe(true);
    if (isQueryOk(result)) {
      expect(result.data.data).toEqual([]);
      expect(result.data.pagination.totalItems).toBe(0);
      expect(result.data.pagination.totalPages).toBe(0);
    }
    expect(mockAuthorRepository.getAllPaginated).toHaveBeenCalledTimes(1);
  });

  it('should return error when repository result is unsuccessful', async () => {
    mockAuthorRepository.getAllPaginated.mockResolvedValue({
      success: false,
      error: 'Database failure',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    const pagination = { page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE };
    const query = new ReadAuthorListQuery(pagination);
    const result = await sut.handle(query);

    expect(isQueryFail(result)).toBe(true);
    if (isQueryFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Database failure');
      expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    expect(mockAuthorRepository.getAllPaginated).toHaveBeenCalledTimes(1);
  });

  it('should return generic error when repository result has no error message', async () => {
    mockAuthorRepository.getAllPaginated.mockResolvedValue({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });

    const pagination = { page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE };
    const query = new ReadAuthorListQuery(pagination);
    const result = await sut.handle(query);

    expect(isQueryFail(result)).toBe(true);
    if (isQueryFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Failed to retrieve authors');
      expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });

  it('should correctly calculate total pages for various scenarios', async () => {
    const testCases = [
      { totalCount: 25, pageSize: 10, expectedPages: 3 },
      { totalCount: 30, pageSize: 10, expectedPages: 3 },
      { totalCount: 31, pageSize: 10, expectedPages: 4 },
      { totalCount: 1, pageSize: 10, expectedPages: 1 },
      { totalCount: 0, pageSize: 10, expectedPages: 0 },
    ];

    for (const testCase of testCases) {
      mockAuthorRepository.getAllPaginated.mockResolvedValue({
        success: true,
        data: { items: [], totalCount: testCase.totalCount },
        statusCode: 0,
      });

      const pagination = { page: 1, pageSize: testCase.pageSize };
      const query = new ReadAuthorListQuery(pagination);
      const result = await sut.handle(query);

      if (isQueryOk(result)) {
        expect(result.data.pagination.totalPages).toBe(testCase.expectedPages);
      }
    }
  });
});
