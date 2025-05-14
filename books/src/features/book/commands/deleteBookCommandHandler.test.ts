import { BookRepository } from '../../../data/repos/bookRepository';
import { DeleteBookCommandHandler } from './deleteBook.command.handler';
import { DeleteBookValidator } from '../validators/deleteBook.validator';
import { DeleteBookCommand } from './deleteBook.command';
import { CommandResult } from '../../../libs/cqrs/commandResult';

describe('DeleteBookCommandHandler', () => {
  let handler: DeleteBookCommandHandler;
  let mockRepo: jest.Mocked<BookRepository>;
  let mockValidator: jest.Mocked<DeleteBookValidator>;

  beforeEach(() => {
    mockRepo = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockValidator = new DeleteBookValidator(mockRepo) as jest.Mocked<DeleteBookValidator>;
    mockValidator.validate = jest.fn();
    handler = new DeleteBookCommandHandler(mockRepo, mockValidator);
  });

  it('should delete the book successfully', async () => {
    const command = new DeleteBookCommand('0365ea2a-4afc-4916-a933-5c7a5ae067e0');
    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.delete.mockResolvedValue({ success: true });

    const result: CommandResult<void> = await handler.handle(command);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should fail validation if ID is invalid', async () => {
    const command = new DeleteBookCommand('invalid-uuid');
    mockValidator.validate.mockResolvedValue({ valid: false, error: new Error('Invalid book ID format') });

    const result: CommandResult<void> = await handler.handle(command);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toBe('Invalid book ID format');
    expect(result.code).toBe('ValidationError');
  });

  it('should fail if book does not exist', async () => {
    const command = new DeleteBookCommand('93350a6a-c6f2-4e25-b55c-838c6029336f');
    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.delete.mockRejectedValue(new Error('Book not found'));

    const result: CommandResult<void> = await handler.handle(command);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toBe('Unexpected error deleting book');
    expect(result.code).toBe('InternalError');
  });

  it('should handle unexpected repository errors', async () => {
    const command = new DeleteBookCommand('0365ea2a-4afc-4916-a933-5c7a5ae067e0');
    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.delete.mockRejectedValue(new Error('Database connection error'));

    const result: CommandResult<void> = await handler.handle(command);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toBe('Unexpected error deleting book');
    expect(result.code).toBe('InternalError');
  });
});
