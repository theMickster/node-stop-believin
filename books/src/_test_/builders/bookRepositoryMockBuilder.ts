import { DeepMockProxy } from 'jest-mock-extended';
import { BookRepository } from '@data/repos/book.repository';
import { Book } from '@data/entities/book.entity';
import { repoOk, repoFail } from '@data/libs/repoResult';

/**
 * Fluent builder for setting up BookRepository mocks
 */
export class BookRepositoryMockBuilder {
  constructor(private readonly mockRepo: DeepMockProxy<BookRepository>) {}

  /**
   * Mock getAll to return a successful result with the given books
   */
  getAllReturns(books: Book[]): this {
    this.mockRepo.getAll.mockResolvedValue(repoOk(books));
    return this;
  }

  /**
   * Mock getAll to return a failure
   */
  getAllFails(message = 'Database error', statusCode = 500): this {
    this.mockRepo.getAll.mockResolvedValue(repoFail(message, statusCode));
    return this;
  }

  /**
   * Mock getById to return a successful result with the given book
   */
  getByIdReturns(book: Book): this {
    this.mockRepo.getById.mockResolvedValue(repoOk(book));
    return this;
  }

  /**
   * Mock getById to return a failure
   */
  getByIdFails(message = 'Book not found', statusCode = 404): this {
    this.mockRepo.getById.mockResolvedValue(repoFail(message, statusCode));
    return this;
  }

  /**
   * Mock getById to return null (wrapped in success)
   */
  getByIdReturnsNull(): this {
    this.mockRepo.getById.mockResolvedValue(repoOk(null as unknown as Book));
    return this;
  }

  /**
   * Mock isbnExists to return a successful result with the given boolean
   */
  isbnExistsReturns(exists: boolean): this {
    this.mockRepo.isbnExists.mockResolvedValue(repoOk(exists));
    return this;
  }

  /**
   * Mock isbnExists to return a failure
   */
  isbnExistsFails(message = 'Database error', statusCode = 500): this {
    this.mockRepo.isbnExists.mockResolvedValue(repoFail(message, statusCode));
    return this;
  }

  /**
   * Mock create to return a successful result with the given book
   */
  createReturns(book: Book): this {
    this.mockRepo.create.mockResolvedValue(repoOk(book));
    return this;
  }

  /**
   * Mock create to return a failure
   */
  createFails(message = 'Database error', statusCode = 500): this {
    this.mockRepo.create.mockResolvedValue(repoFail(message, statusCode));
    return this;
  }

  /**
   * Mock create to return null (wrapped in success)
   */
  createReturnsNull(): this {
    this.mockRepo.create.mockResolvedValue(repoOk(null as unknown as Book));
    return this;
  }

  /**
   * Mock update to return a successful result with the given book
   */
  updateReturns(book: Book): this {
    this.mockRepo.update.mockResolvedValue(repoOk(book));
    return this;
  }

  /**
   * Mock update to return a failure
   */
  updateFails(message = 'Database error', statusCode = 500): this {
    this.mockRepo.update.mockResolvedValue(repoFail(message, statusCode));
    return this;
  }

  /**
   * Mock update to return null (wrapped in success)
   */
  updateReturnsNull(): this {
    this.mockRepo.update.mockResolvedValue(repoOk(null as unknown as Book));
    return this;
  }

  /**
   * Mock delete to return a successful result
   */
  deleteReturns(): this {
    this.mockRepo.delete.mockResolvedValue(repoOk(undefined));
    return this;
  }

  /**
   * Mock delete to return a failure
   */
  deleteFails(message = 'Database error', statusCode = 500): this {
    this.mockRepo.delete.mockResolvedValue(repoFail(message, statusCode));
    return this;
  }

  /**
   * Set up the standard happy path: book exists, ISBN doesn't exist, update succeeds
   */
  setupHappyPath(book: Book, updatedBook: Book): this {
    return this.getByIdReturns(book).isbnExistsReturns(false).updateReturns(updatedBook);
  }

  /**
   * Get the underlying mock repository
   */
  build(): DeepMockProxy<BookRepository> {
    return this.mockRepo;
  }
}

/**
 * Create a new BookRepositoryMockBuilder
 */
export function buildBookRepoMock(
  mockRepo: DeepMockProxy<BookRepository>,
): BookRepositoryMockBuilder {
  return new BookRepositoryMockBuilder(mockRepo);
}
