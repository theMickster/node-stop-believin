import { DeepMockProxy } from 'jest-mock-extended';

import { Author } from '@data/entities/author.entity';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { AuthorRepository } from '@data/repos/author.repository';

/**
 * Fluent builder for setting up AuthorRepository mocks
 */
export class AuthorRepositoryMockBuilder {
  constructor(private readonly mockRepo: DeepMockProxy<AuthorRepository>) {}

  /**
   * Mock getAll to return a successful result with the given authors
   */
  getAllReturns(authors: Author[]): this {
    this.mockRepo.getAll.mockResolvedValue(repoOk(authors));
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
   * Mock getById to return a successful result with the given author
   */
  getByIdReturns(author: Author): this {
    this.mockRepo.getById.mockResolvedValue(repoOk(author));
    return this;
  }

  /**
   * Mock getById to return a failure
   */
  getByIdFails(message = 'Author not found', statusCode = 404): this {
    this.mockRepo.getById.mockResolvedValue(repoFail(message, statusCode));
    return this;
  }

  /**
   * Mock getById to return null (wrapped in success)
   */
  getByIdReturnsNull(): this {
    this.mockRepo.getById.mockResolvedValue(repoOk(null as unknown as Author));
    return this;
  }

  /**
   * Mock create to return a successful result with the given author
   */
  createReturns(author: Author): this {
    this.mockRepo.create.mockResolvedValue(repoOk(author));
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
    this.mockRepo.create.mockResolvedValue(repoOk(null as unknown as Author));
    return this;
  }

  /**
   * Mock update to return a successful result with the given author
   */
  updateReturns(author: Author): this {
    this.mockRepo.update.mockResolvedValue(repoOk(author));
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
   * Mock delete to return a successful result
   */
  deleteReturns(): this {
    this.mockRepo.delete.mockResolvedValue(repoOk(undefined as void));
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
   * Get the underlying mock repository
   */
  build(): DeepMockProxy<AuthorRepository> {
    return this.mockRepo;
  }
}

/**
 * Create a new AuthorRepositoryMockBuilder
 */
export function buildAuthorRepoMock(
  mockRepo: DeepMockProxy<AuthorRepository>,
): AuthorRepositoryMockBuilder {
  return new AuthorRepositoryMockBuilder(mockRepo);
}
