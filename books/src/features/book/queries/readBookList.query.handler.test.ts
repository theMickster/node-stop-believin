import { fakeBooks } from '@fixtures/books';

import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { isQueryFail, isQueryOk } from '@libs/cqrs/queryResult';

import { mapBookToReadBookDto } from '@data/mapping/bookMappers';
import { BookRepository } from '@data/repos/book.repository';

import { ReadBookListQueryHandler } from './readBookList.query.handler';


jest.mock('@data/repos/book.repository');

describe('ReadBookListQueryHandler', () => {
  let mockBookRepository: jest.Mocked<BookRepository>;
  let sut: ReadBookListQueryHandler;
  beforeEach(() => {
    mockBookRepository = {
      getAll: jest.fn(),
    } as unknown as jest.Mocked<BookRepository>;

    sut = new ReadBookListQueryHandler(mockBookRepository);
  });

  it('should return QueryResult with books when repository result is successful', async () => {
    mockBookRepository.getAll.mockResolvedValue({
      success: true,
      data: fakeBooks,
      statusCode: 0,
    });

    const result = await sut.handle({});

    expect(mockBookRepository.getAll).toHaveBeenCalledTimes(1);
    expect(isQueryOk(result)).toBe(true);

    if (isQueryOk(result)) {
      const expectedDtos = fakeBooks.map(mapBookToReadBookDto);
      expect(result.data).toEqual(expectedDtos);
    }
  });

  it('should return QueryResult with empty array if result is success but no data', async () => {
    mockBookRepository.getAll.mockResolvedValue({
      success: true,
      data: [],
      statusCode: 0,
    });

    const result = await sut.handle({});

    expect(mockBookRepository.getAll).toHaveBeenCalledTimes(1);
    expect(isQueryOk(result)).toBe(true);

    if (isQueryOk(result)) {
      expect(result.data).toEqual([]);
    }
  });

  it('should return QueryResult with error when repository result is unsuccessful', async () => {
    mockBookRepository.getAll.mockResolvedValue({
      success: false,
      error: 'Database failure',
      statusCode: 500,
    });

    const result = await sut.handle({});

    expect(mockBookRepository.getAll).toHaveBeenCalledTimes(1);
    expect(isQueryFail(result)).toBe(true);

    if (isQueryFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Database failure');
      expect(result.error.statusCode).toBe(500);
    }
  });

  it('should return QueryResult with generic error when repository result has no error message', async () => {
    mockBookRepository.getAll.mockResolvedValue({
      success: false,
      statusCode: 500,
    });

    const result = await sut.handle({});

    expect(isQueryFail(result)).toBe(true);

    if (isQueryFail(result)) {
      expect(result.error.message).toBe('Failed to retrieve books');
    }
  });
});
