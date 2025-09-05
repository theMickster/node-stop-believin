import { buildBookRepoMock } from '@tests/builders/bookRepositoryMockBuilder';
import { buildMockExecutionContext } from '@tests/builders/executionContextMockBuilder';
import { expectCommandSuccess, expectValidationError, expectDatabaseError } from '@tests/helpers/commandAssertions';
import { mock, mockReset } from 'jest-mock-extended';

import { ILogger } from '@libs/logging/logger.interface';

import { BookRepository } from '@data/repos/book.repository';

import { DeleteBookValidator } from '../validators/deleteBook.validator';

import { DeleteBookCommand } from './deleteBook.command';
import { DeleteBookCommandHandler } from './deleteBook.command.handler';

describe('DeleteBookCommandHandler', () => {
  const mockRepo = mock<BookRepository>();
  const mockLogger = mock<ILogger>();
  const mockContext = buildMockExecutionContext().build();
  let handler: DeleteBookCommandHandler;
  let mockValidator: jest.Mocked<DeleteBookValidator>;

  beforeEach(() => {
    mockReset(mockRepo);
    mockReset(mockLogger);

    mockValidator = new DeleteBookValidator(mockRepo) as jest.Mocked<DeleteBookValidator>;
    mockValidator.validate = jest.fn();
    handler = new DeleteBookCommandHandler(mockRepo, mockValidator, mockLogger);
  });

  it('should delete the book successfully', async () => {
    const command = new DeleteBookCommand('0365ea2a-4afc-4916-a933-5c7a5ae067e0', mockContext);
    mockValidator.validate.mockResolvedValue({ valid: true });
    buildBookRepoMock(mockRepo).deleteReturns();

    const result = await handler.handle(command);

    expectCommandSuccess(result);
  });

  it('should fail validation if ID is invalid', async () => {
    const command = new DeleteBookCommand('invalid-uuid', mockContext);
    mockValidator.validate.mockResolvedValue({ valid: false, error: new Error('Invalid book ID format') });

    const result = await handler.handle(command);

    expectValidationError(result, 'Invalid book ID format');
  });

  it('should fail if book does not exist', async () => {
    const command = new DeleteBookCommand('93350a6a-c6f2-4e25-b55c-838c6029336f', mockContext);
    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.delete.mockRejectedValue(new Error('Book not found'));

    const result = await handler.handle(command);

    expectDatabaseError(result, 'Unexpected error deleting book');
  });

  it('should handle unexpected repository errors', async () => {
    const command = new DeleteBookCommand('0365ea2a-4afc-4916-a933-5c7a5ae067e0', mockContext);
    mockValidator.validate.mockResolvedValue({ valid: true });
    mockRepo.delete.mockRejectedValue(new Error('Database connection error'));

    const result = await handler.handle(command);

    expectDatabaseError(result, 'Unexpected error deleting book');
  });
});
