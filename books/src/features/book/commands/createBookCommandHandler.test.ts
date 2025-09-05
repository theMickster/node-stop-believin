import { buildBookRepoMock } from '@tests/builders/bookRepositoryMockBuilder';
import { buildMockExecutionContext } from '@tests/builders/executionContextMockBuilder';
import { expectCommandSuccess, expectValidationError, expectDatabaseError } from '@tests/helpers/commandAssertions';
import { mock, mockReset } from 'jest-mock-extended';

import { HttpStatus } from '@libs/cqrs/httpStatusCodes';

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
    expectCommandSuccess(result, (data) => {
      expect(data).toEqual(fakeBook);
    });
  });

  it('should return CommandResult with error when validation fails', async () => {
    const dto = {
      name: '',
      authors: [{ authorId: '29311e65-4ed1-4fb6-bbc0-c72d677a466d', firstName: 'Jane', lastName: 'Doe', order: 1 }],
    };
    const cmd = new CreateBookCommand(dto, mockContext);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).not.toHaveBeenCalled();
    expectValidationError(result, 'Book name is required');
  });

  it('should return CommandResult with error when repository returns a failure', async () => {
    const dto = {
      name: 'A Great Book Vol 3',
      authors: [{ authorId: '1fed4b21-2876-4b38-a925-6101fda071a1', firstName: 'Peter', lastName: 'Doe', order: 1 }],
    };
    const cmd = new CreateBookCommand(dto, mockContext);
    buildBookRepoMock(mockRepo).createFails('Cosmos DB is down', HttpStatus.INTERNAL_SERVER_ERROR);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).toHaveBeenCalled();
    expectDatabaseError(result, 'Cosmos DB is down');
  });

  it('should return CommandResult with generic error when repo fails without error text', async () => {
    const dto = {
      name: 'A Great Book Vol 4',
      authors: [{ authorId: '1fed4b21-2876-4b38-a925-6101fda071a1', firstName: 'Peter', lastName: 'Doe', order: 1 }],
    };
    const cmd = new CreateBookCommand(dto, mockContext);
    mockRepo.create.mockResolvedValue({ success: false, statusCode: HttpStatus.INTERNAL_SERVER_ERROR });

    const result = await sut.handle(cmd);

    expectDatabaseError(result, 'Unknown error creating book');
  });
});
