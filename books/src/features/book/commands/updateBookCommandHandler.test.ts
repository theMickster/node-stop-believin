import { BookRepository } from '@data/repos/bookRepository';
import { UpdateBookDto } from '../models/updateBookDto';
import { UpdateBookValidator } from '../validators/updateBook.validator';
import { UpdateBookCommandHandler } from './updateBook.command.handler';
import { Book } from '@data/entities/book';
import { commandOk } from '@libs/cqrs/commandResult';
import { UpdateBookCommand } from './updateBook.command';

describe('UpdateBookCommandHandler', () => {
  let mockRepo: jest.Mocked<BookRepository>;
  let mockValidator: jest.Mocked<UpdateBookValidator>;

  const validDto: UpdateBookDto = {
    id: '123',
    name: 'Updated name',
    authors: [{ authorId: '456', firstName: 'Steve', lastName: 'Smith' }],
  };

  let sut: UpdateBookCommandHandler;

  beforeEach(() => {
    mockRepo = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockValidator = new UpdateBookValidator(mockRepo) as jest.Mocked<UpdateBookValidator>;
    mockValidator.validate = jest.fn();
    sut = new UpdateBookCommandHandler(mockRepo, mockValidator);
  });

  it('should update the book successfully', async () => {
    const command = new UpdateBookCommand(validDto);
    const updatedBook: Book = {
      id: validDto.id,
      bookId: validDto.id,
      entityType: 'Book',
      name: validDto.name,
      authors: validDto.authors,
    };

    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.update.mockResolvedValue(Promise.resolve({ success: true, data: updatedBook }));

    const result = await sut.handle(command);

    expect(result).toEqual(commandOk(updatedBook));
    expect(mockRepo.update).toHaveBeenCalledWith(updatedBook);
    expect(mockValidator.validate).toHaveBeenCalledWith(validDto);
  });

  it('should throw an error if the repository update fails (no error message)', async () => {
    const command = new UpdateBookCommand(validDto);

    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.update.mockResolvedValue(Promise.resolve({ success: false, data: null, error: null }));

    await expect(sut.handle(command)).rejects.toThrow('Unknown error updating book');
  });

  it('should throw the error message from the repository if update fails', async () => {
    const command = new UpdateBookCommand(validDto);    
    const repoErrorMessage = 'Failed to update in the database';
    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.update.mockResolvedValue(Promise.resolve({ success: false, data: null, error: repoErrorMessage }));

    await expect(sut.handle(command)).rejects.toThrow(repoErrorMessage);
  });
});
