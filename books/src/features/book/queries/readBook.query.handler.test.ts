import { fakeBooks } from '@fixtures/books';

import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { isQueryFail, isQueryOk } from '@libs/cqrs/queryResult';

import { Book } from '@data/entities/book.entity';
import { RepoResult } from '@data/libs/repoResult';
import { BookRepository } from '@data/repos/book.repository';

import { ReadBookQueryHandler } from './readBook.query.handler';

jest.mock('@data/repos/book.repository');

describe('ReadBookQueryHandler', () => {
  let mockBookRepository: jest.Mocked<BookRepository>;
  let sut: ReadBookQueryHandler;
  const query = { id: 'd551376d-d645-4311-880b-accad096112b' };

  const successResult: RepoResult<Book> = {
    success: true,
    data: fakeBooks[1],
    statusCode: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockBookRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<BookRepository>;

    sut = new ReadBookQueryHandler(mockBookRepository);
  });

  it('should return a QueryResult with book data if it exists', async () => {
    mockBookRepository.getById.mockResolvedValue(successResult);

    const result = await sut.handle(query);

    expect(mockBookRepository.getById).toHaveBeenCalledWith(query.id);
    expect(isQueryOk(result)).toBe(true);

    if (isQueryOk(result) && result.data) {
      expect(result.data.id).toEqual('d551376d-d645-4311-880b-accad096112b');
      expect(result.data.authors.length).toEqual(1);
      expect(result.data.name).toEqual('Complete Guide to Azure AI for ML Engineers');
    }
  });

  it('should return QueryResult with null data if the book is not found', async () => {
    const notFoundResult: RepoResult<Book> = { success: false, data: null, error: 'Book not found', statusCode: 404 };
    mockBookRepository.getById.mockResolvedValue(notFoundResult);

    const result = await sut.handle(query);

    expect(mockBookRepository.getById).toHaveBeenCalledWith(query.id);
    expect(isQueryOk(result)).toBe(true);

    if (isQueryOk(result)) {
      expect(result.data).toBeNull();
    }
  });

  it('should return QueryResult with error if repository fails', async () => {
    mockBookRepository.getById.mockResolvedValue({ success: false, data: null, error: null, statusCode: 500 });

    const result = await sut.handle(query);

    expect(mockBookRepository.getById).toHaveBeenCalledWith(query.id);
    expect(isQueryFail(result)).toBe(true);

    if (isQueryFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Failed to retrieve book');
      expect(result.error.statusCode).toBe(500);
    }
  });
});
