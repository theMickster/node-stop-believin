
import { Book } from '@data/entities/book';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { BookRepository } from '@data/repos/bookRepository';
import { ValidationError } from 'joi';
import { CreateBookCommand } from './createBook.command';
import { CreateBookCommandHandler } from './createBook.command.handler';

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
        { authorId: '00000000-0000-0000-0000-000000000001', firstName: 'Jane', lastName: 'Doe' },
        { authorId: '00000000-0000-0000-0000-000000000002', firstName: 'John', lastName: 'Doe' },
      ],
    };
    const cmd = new CreateBookCommand(dto);
    jest.spyOn(cmd, 'validate').mockReturnValue({ error: undefined, value: dto });

    const fakeBook: Book = { id: '1', bookId: '1', entityType: 'Book', name: 'A Great Book', authors: dto.authors };
    mockRepo.create.mockResolvedValue(repoOk(fakeBook));

    const result = await sut.handle(cmd);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(result).toEqual(fakeBook);
  });

  it('should throw correct error when validation fails', async () => {
    const dto = {
      name: 'A Great Book Vol 2',
      authors: [
        { authorId: '00000000-0000-0000-0000-000000000007', firstName: 'Jane', lastName: 'Doe' },
      ],
    };
    const cmd = new CreateBookCommand(dto);

    const validatorError: ValidationError = {
      name: 'ValidationError',
          isJoi: true,
          message: 'invalid DTO',
          details: [],
          _original: dto,
          annotate: () => 'annotated',
    };

    jest.spyOn(cmd, 'validate').mockReturnValue({ error: validatorError, value: null });

    await expect(sut.handle(cmd)).rejects.toThrow('Validation failed: invalid DTO');
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should throw correct error when repository returns a failure', async () => {
    const dto = {
      name: 'A Great Book Vol 3',
      authors: [
        { authorId: '00000000-0000-0000-0000-000000000007', firstName: 'Peter', lastName: 'Doe' },
      ],
    };
    const cmd = new CreateBookCommand(dto);
    jest.spyOn(cmd, 'validate').mockReturnValue({ error: undefined, value: dto });

    mockRepo.create.mockResolvedValue(repoFail('Cosmos DB is down'));

    await expect(sut.handle(cmd)).rejects.toThrow('Cosmos DB is down');
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should throw generic message when repo fails without error text', async () => {
    const dto = {
      name: 'A Great Book Vol 4',
      authors: [
        { authorId: '00000000-0000-0000-0000-000000000007', firstName: 'Peter', lastName: 'Doe' },
      ],
    };
    const cmd = new CreateBookCommand(dto);
    jest.spyOn(cmd, 'validate').mockReturnValue({ error: undefined, value: dto });

    mockRepo.create.mockResolvedValue({ success: false });

    await expect(sut.handle(cmd)).rejects.toThrow('Unknown error creating book');
  });
});
