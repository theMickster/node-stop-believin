import { BookRepository } from '@data/repos/bookRepository';
import { ReadBookListQueryHandler } from './readBookList.query.handler';
import { fakeBooks } from '@fixtures/books';

jest.mock('@data/repos/bookRepository');

describe('ReadBookListQueryHandler', () => {
  let mockBookRepository: jest.Mocked<BookRepository>;
  let sut: ReadBookListQueryHandler;
  beforeEach(() => {
    mockBookRepository = {
      getAll: jest.fn(),
    } as unknown as jest.Mocked<BookRepository>;

    sut = new ReadBookListQueryHandler(mockBookRepository);
  });

  it('should return books when repository result is successful', async () => {
    mockBookRepository.getAll.mockResolvedValue({
      success: true,
      data: fakeBooks,
    });

    const result = await sut.handle({});

    expect(result).toEqual(fakeBooks);
    expect(mockBookRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array if result is success but no data', async () => {
    mockBookRepository.getAll.mockResolvedValue({
      success: true,
      data: [],
    });

    const result = await sut.handle({});

    expect(result).toEqual([]);
    expect(mockBookRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when repository result is unsuccessful', async () => {
    mockBookRepository.getAll.mockResolvedValue({
      success: false,
      error: 'Database failure',
    });

    await expect(sut.handle({})).rejects.toThrow('Database failure');
    expect(mockBookRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('should throw a generic error when repository result has no error message', async () => {
    mockBookRepository.getAll.mockResolvedValue({
      success: false,
    });

    await expect(sut.handle({})).rejects.toThrow('Failed to retrieve books');
  });
});
