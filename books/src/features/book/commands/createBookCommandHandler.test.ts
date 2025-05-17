import { BookRepository } from 'data/repos/bookRepository';
import { CreateBookCommandHandler } from './createBook.command.handler';
import { CreateBookCommand } from './createBook.command';
import { Book } from '../../../data/entities/book';
import { repoOk, repoFail } from '../../../data/libs/repoResult';

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
        { authorId: 'd5f5bc1c-d2c7-408b-b757-60ef713b47e9', firstName: 'Jane', lastName: 'Doe' },
        { authorId: '29311e65-4ed1-4fb6-bbc0-c72d677a466d', firstName: 'John', lastName: 'Doe' },
      ],
    };
    const cmd = new CreateBookCommand(dto);
    
    const fakeBook: Book = { id: '1', bookId: '1', entityType: 'Book', name: 'A Great Book', authors: dto.authors };
    mockRepo.create.mockResolvedValue(repoOk(fakeBook));

    const result = await sut.handle(cmd);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(result).toEqual(fakeBook);
  });

  it('should throw correct error when validation fails', async () => {
    const dto = {
      name: '',
      authors: [
        { authorId: '29311e65-4ed1-4fb6-bbc0-c72d677a466d', firstName: 'Jane', lastName: 'Doe' },
      ],
    };
    const cmd = new CreateBookCommand(dto);  

    await expect(sut.handle(cmd)).rejects.toThrow('Validation failed: Book name is required');
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should throw correct error when repository returns a failure', async () => {
    const dto = {
      name: 'A Great Book Vol 3',
      authors: [
        { authorId: '1fed4b21-2876-4b38-a925-6101fda071a1', firstName: 'Peter', lastName: 'Doe' },
      ],
    };
    const cmd = new CreateBookCommand(dto);
    mockRepo.create.mockResolvedValue(repoFail('Cosmos DB is down'));

    await expect(sut.handle(cmd)).rejects.toThrow('Cosmos DB is down');
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should throw generic message when repo fails without error text', async () => {
    const dto = {
      name: 'A Great Book Vol 4',
      authors: [
        { authorId: '1fed4b21-2876-4b38-a925-6101fda071a1', firstName: 'Peter', lastName: 'Doe' },
      ],
    };
    const cmd = new CreateBookCommand(dto);
    mockRepo.create.mockResolvedValue({ success: false });

    await expect(sut.handle(cmd)).rejects.toThrow('Unknown error creating book');
  });
});
