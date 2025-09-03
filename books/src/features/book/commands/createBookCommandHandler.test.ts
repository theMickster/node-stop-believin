import { buildBookRepoMock } from '_test_/builders/bookRepositoryMockBuilder';
import { buildMockExecutionContext } from '_test_/builders/executionContextMockBuilder';
import { mock, mockReset } from 'jest-mock-extended';

import { isCommandFail, isCommandOk } from '@libs/cqrs/commandResult';
import { ErrorCodes } from '@libs/cqrs/errorCodes';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { BookRepository } from '@data/repos/book.repository';

import { Book } from '../../../data/entities/book.entity';

import { CreateBookCommand } from './createBook.command';
import { CreateBookCommandHandler } from './createBook.command.handler';


describe('CreateBookCommandHandler', () => {
  const mockRepo = mock<BookRepository>();
  const mockContext = buildMockExecutionContext()
    .withUserId('test-user-123')
    .withTimestamp(new Date('2024-01-01'))
    .build();
  let sut: CreateBookCommandHandler;

  beforeEach(() => {
    mockReset(mockRepo);
    sut = new CreateBookCommandHandler(mockRepo);
  });

  it('should successfully create a new book', async () => {
    const dto = {
      name: 'A Great Book',
      authors: [
        { authorId: 'd5f5bc1c-d2c7-408b-b757-60ef713b47e9', firstName: 'Jane', lastName: 'Doe', order: 1 },
        { authorId: '29311e65-4ed1-4fb6-bbc0-c72d677a466d', firstName: 'John', lastName: 'Doe', order: 1 },
      ],
    };
    const cmd = new CreateBookCommand(dto, mockContext);

    const fakeBook: Book = {
      id: '1',
      bookId: '1',
      entityType: ENTITY_TYPES.BOOK,
      name: 'A Great Book',
      authors: dto.authors,
      createdAt: new Date('2024-01-01'),
      createdBy: 'test-user-123',
      updatedAt: new Date('2024-01-01'),
      updatedBy: 'test-user-123',
      isDeleted: false,
      version: 1,
    };
    buildBookRepoMock(mockRepo).createReturns(fakeBook);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(isCommandOk(result)).toBe(true);

    if (isCommandOk(result)) {
      expect(result.data).toEqual(fakeBook);
    }
  });

  it('should return CommandResult with error when validation fails', async () => {
    const dto = {
      name: '',
      authors: [{ authorId: '29311e65-4ed1-4fb6-bbc0-c72d677a466d', firstName: 'Jane', lastName: 'Doe', order: 1 }],
    };
    const cmd = new CreateBookCommand(dto, mockContext);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      expect(result.error.message).toContain('Book name is required');
    }
  });

  it('should return CommandResult with error when repository returns a failure', async () => {
    const dto = {
      name: 'A Great Book Vol 3',
      authors: [{ authorId: '1fed4b21-2876-4b38-a925-6101fda071a1', firstName: 'Peter', lastName: 'Doe', order: 1 }],
    };
    const cmd = new CreateBookCommand(dto, mockContext);
    buildBookRepoMock(mockRepo).createFails('Cosmos DB is down', 500);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Cosmos DB is down');
    }
  });

  it('should return CommandResult with generic error when repo fails without error text', async () => {
    const dto = {
      name: 'A Great Book Vol 4',
      authors: [{ authorId: '1fed4b21-2876-4b38-a925-6101fda071a1', firstName: 'Peter', lastName: 'Doe', order: 1 }],
    };
    const cmd = new CreateBookCommand(dto, mockContext);
    mockRepo.create.mockResolvedValue({ success: false, statusCode: 500 });

    const result = await sut.handle(cmd);

    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.message).toBe('Unknown error creating book');
    }
  });
});
