import { BookRepository } from '@data/repos/book.repository';
import { CreateBookCommandHandler } from './createBook.command.handler';
import { CreateBookCommand } from './createBook.command';
import { Book } from '../../../data/entities/book.entity';
import { repoOk, repoFail } from '../../../data/libs/repoResult';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { isCommandFail, isCommandOk } from '@libs/cqrs/commandResult';
import { ErrorCodes } from '@libs/cqrs/errorCodes';

describe('CreateBookCommandHandler', () => {
  let mockRepo: jest.Mocked<BookRepository>;
  let sut: CreateBookCommandHandler;

  beforeEach(() => {
    mockRepo = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
    } as any;

    sut = new CreateBookCommandHandler(mockRepo);
    jest.clearAllMocks();
  });

  it('should successfully create a new book', async () => {
    const dto = {
      name: 'A Great Book',
      authors: [
        { authorId: 'd5f5bc1c-d2c7-408b-b757-60ef713b47e9', firstName: 'Jane', lastName: 'Doe', order: 1 },
        { authorId: '29311e65-4ed1-4fb6-bbc0-c72d677a466d', firstName: 'John', lastName: 'Doe', order: 1 },
      ],
    };
    const cmd = new CreateBookCommand(dto);

    const fakeBook: Book = {
      id: '1',
      bookId: '1',
      entityType: ENTITY_TYPES.BOOK,
      name: 'A Great Book',
      authors: dto.authors,
      createdAt: new Date('2024-01-01'),
      createdBy: 'test-user',
      updatedAt: new Date('2024-01-01'),
      updatedBy: 'test-user',
      isDeleted: false,
      version: 1,
    };
    mockRepo.create.mockResolvedValue(repoOk(fakeBook));

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
    const cmd = new CreateBookCommand(dto);

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
    const cmd = new CreateBookCommand(dto);
    mockRepo.create.mockResolvedValue(repoFail('Cosmos DB is down', 500));

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
    const cmd = new CreateBookCommand(dto);
    mockRepo.create.mockResolvedValue({ success: false, statusCode: 500 });

    const result = await sut.handle(cmd);

    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.message).toBe('Unknown error creating book');
    }
  });
});
