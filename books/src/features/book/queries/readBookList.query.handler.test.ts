import { fakeBooks } from '@fixtures/books';

import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { isQueryFail, isQueryOk } from '@libs/cqrs/queryResult';
import { PAGINATION_DEFAULTS } from '@libs/types/pagination.types';

import { mapBookToReadBookDto } from '@data/mapping/bookMappers';
import { BookRepository } from '@data/repos/book.repository';

import { ReadBookListQuery } from './readBookList.query';
import { ReadBookListQueryHandler } from './readBookList.query.handler';


jest.mock('@data/repos/book.repository');

describe('ReadBookListQueryHandler', () => {
  let mockBookRepository: jest.Mocked<BookRepository>;
  let sut: ReadBookListQueryHandler;
  beforeEach(() => {
    mockBookRepository = {
      getAllPaginated: jest.fn(),
    } as unknown as jest.Mocked<BookRepository>;

    sut = new ReadBookListQueryHandler(mockBookRepository);
  });

  it('should return QueryResult with paginated books when repository result is successful', async () => {
    const totalCount = 47;
    mockBookRepository.getAllPaginated.mockResolvedValue({
      success: true,
      data: { items: fakeBooks, totalCount },
      statusCode: 0,
    });

    const pagination = { page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE };
    const query = new ReadBookListQuery(pagination);
    const result = await sut.handle(query);

    expect(mockBookRepository.getAllPaginated).toHaveBeenCalledTimes(1);
    expect(mockBookRepository.getAllPaginated).toHaveBeenCalledWith(pagination, undefined);
    expect(isQueryOk(result)).toBe(true);

    if (isQueryOk(result)) {
      const expectedDtos = fakeBooks.map(mapBookToReadBookDto);
      expect(result.data.data).toEqual(expectedDtos);
      expect(result.data.pagination).toEqual({
        page: 1,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / PAGINATION_DEFAULTS.PAGE_SIZE),
      });
    }
  });

  it('should return QueryResult with empty array if result is success but no data', async () => {
    mockBookRepository.getAllPaginated.mockResolvedValue({
      success: true,
      data: { items: [], totalCount: 0 },
      statusCode: 0,
    });

    const pagination = { page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE };
    const query = new ReadBookListQuery(pagination);
    const result = await sut.handle(query);

    expect(mockBookRepository.getAllPaginated).toHaveBeenCalledTimes(1);
    expect(isQueryOk(result)).toBe(true);

    if (isQueryOk(result)) {
      expect(result.data.data).toEqual([]);
      expect(result.data.pagination.totalItems).toBe(0);
      expect(result.data.pagination.totalPages).toBe(0);
    }
  });

  it('should return QueryResult with error when repository result is unsuccessful', async () => {
    mockBookRepository.getAllPaginated.mockResolvedValue({
      success: false,
      error: 'Database failure',
      statusCode: 500,
    });

    const pagination = { page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE };
    const query = new ReadBookListQuery(pagination);
    const result = await sut.handle(query);

    expect(mockBookRepository.getAllPaginated).toHaveBeenCalledTimes(1);
    expect(isQueryFail(result)).toBe(true);

    if (isQueryFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Database failure');
      expect(result.error.statusCode).toBe(500);
    }
  });

  it('should return QueryResult with generic error when repository result has no error message', async () => {
    mockBookRepository.getAllPaginated.mockResolvedValue({
      success: false,
      statusCode: 500,
    });

    const pagination = { page: 1, pageSize: PAGINATION_DEFAULTS.PAGE_SIZE };
    const query = new ReadBookListQuery(pagination);
    const result = await sut.handle(query);

    expect(isQueryFail(result)).toBe(true);

    if (isQueryFail(result)) {
      expect(result.error.message).toBe('Failed to retrieve books');
    }
  });

  it('should correctly calculate total pages for various scenarios', async () => {
    const testCases = [
      { totalCount: 47, pageSize: 10, expectedPages: 5 },
      { totalCount: 50, pageSize: 10, expectedPages: 5 },
      { totalCount: 51, pageSize: 10, expectedPages: 6 },
      { totalCount: 1, pageSize: 10, expectedPages: 1 },
      { totalCount: 0, pageSize: 10, expectedPages: 0 },
    ];

    for (const testCase of testCases) {
      mockBookRepository.getAllPaginated.mockResolvedValue({
        success: true,
        data: { items: [], totalCount: testCase.totalCount },
        statusCode: 0,
      });

      const pagination = { page: 1, pageSize: testCase.pageSize };
      const query = new ReadBookListQuery(pagination);
      const result = await sut.handle(query);

      if (isQueryOk(result)) {
        expect(result.data.pagination.totalPages).toBe(testCase.expectedPages);
      }
    }
  });
});
