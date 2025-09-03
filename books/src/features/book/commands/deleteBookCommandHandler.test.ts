import { buildBookRepoMock } from '_test_/builders/bookRepositoryMockBuilder';
import { mock, mockReset } from 'jest-mock-extended';

import { isCommandFail, isCommandOk } from '@libs/cqrs/commandResult';
import { ErrorCodes } from '@libs/cqrs/errorCodes';

import { BookRepository } from '@data/repos/book.repository';

import { DeleteBookValidator } from '../validators/deleteBook.validator';

import { DeleteBookCommand } from './deleteBook.command';
import { DeleteBookCommandHandler } from './deleteBook.command.handler';


describe('DeleteBookCommandHandler', () => {
  const mockRepo = mock<BookRepository>();
  let handler: DeleteBookCommandHandler;
  let mockValidator: jest.Mocked<DeleteBookValidator>;

  beforeEach(() => {
    mockReset(mockRepo);

    mockValidator = new DeleteBookValidator(mockRepo) as jest.Mocked<DeleteBookValidator>;
    mockValidator.validate = jest.fn();
    handler = new DeleteBookCommandHandler(mockRepo, mockValidator);
  });

  it('should delete the book successfully', async () => {
    const command = new DeleteBookCommand('0365ea2a-4afc-4916-a933-5c7a5ae067e0');
    mockValidator.validate.mockResolvedValue({ valid: true });
    buildBookRepoMock(mockRepo).deleteReturns();

    const result = await handler.handle(command);

    expect(isCommandOk(result)).toBe(true);
  });

  it('should fail validation if ID is invalid', async () => {
    const command = new DeleteBookCommand('invalid-uuid');
    mockValidator.validate.mockResolvedValue({ valid: false, error: new Error('Invalid book ID format') });

    const result = await handler.handle(command);

    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.message).toBe('Invalid book ID format');
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
    }
  });

  it('should fail if book does not exist', async () => {
    const command = new DeleteBookCommand('93350a6a-c6f2-4e25-b55c-838c6029336f');
    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.delete.mockRejectedValue(new Error('Book not found'));

    const result = await handler.handle(command);

    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.message).toContain('Unexpected error deleting book');
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
    }
  });

  it('should handle unexpected repository errors', async () => {
    const command = new DeleteBookCommand('0365ea2a-4afc-4916-a933-5c7a5ae067e0');
    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.delete.mockRejectedValue(new Error('Database connection error'));

    const result = await handler.handle(command);

    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.message).toContain('Unexpected error deleting book');
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
    }
  });
});
