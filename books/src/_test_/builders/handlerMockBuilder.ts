import { DeepMockProxy } from 'jest-mock-extended';

import { ICommand } from '@libs/cqrs/command';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { commandOk, commandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { IQuery } from '@libs/cqrs/query';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { queryOk, queryFail } from '@libs/cqrs/queryResult';

/**
 * Fluent builder for setting up CommandHandler mocks
 */
export class CommandHandlerMockBuilder<TCommand extends ICommand, TResult> {
  constructor(private readonly mockHandler: DeepMockProxy<ICommandHandler<TCommand, TResult>>) {}

  /**
   * Mock handler to return a successful result
   */
  returnsSuccess(data: TResult): this {
    this.mockHandler.handle.mockResolvedValue(commandOk(data));
    return this;
  }

  /**
   * Mock handler to return a failure
   */
  returnsFailure(code: (typeof ErrorCodes)[keyof typeof ErrorCodes], message: string, status: number): this {
    this.mockHandler.handle.mockResolvedValue(commandFail(code, message, status));
    return this;
  }

  /**
   * Mock handler to return a not found error
   */
  returnsNotFound(message = 'Not found'): this {
    return this.returnsFailure(ErrorCodes.BOOK_NOT_FOUND, message, HttpStatus.NOT_FOUND);
  }

  /**
   * Mock handler to return a conflict error
   */
  returnsConflict(message: string): this {
    return this.returnsFailure(ErrorCodes.BOOK_ALREADY_EXISTS, message, HttpStatus.CONFLICT);
  }

  /**
   * Mock handler to return a database error
   */
  returnsDatabaseError(message = 'Database error'): this {
    return this.returnsFailure(ErrorCodes.DATABASE_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * Mock handler to return a validation error
   */
  returnsValidationError(message = 'Validation failed'): this {
    return this.returnsFailure(ErrorCodes.VALIDATION_FAILED, message, HttpStatus.BAD_REQUEST);
  }

  /**
   * Get the underlying mock
   */
  build(): DeepMockProxy<ICommandHandler<TCommand, TResult>> {
    return this.mockHandler;
  }
}

/**
 * Fluent builder for setting up QueryHandler mocks
 */
export class QueryHandlerMockBuilder<TQuery extends IQuery, TResult> {
  constructor(private readonly mockHandler: DeepMockProxy<IQueryHandler<TQuery, TResult>>) {}

  /**
   * Mock handler to return a successful result
   */
  returnsSuccess(data: TResult): this {
    this.mockHandler.handle.mockResolvedValue(queryOk(data));
    return this;
  }

  /**
   * Mock handler to return a failure
   */
  returnsFailure(code: (typeof ErrorCodes)[keyof typeof ErrorCodes], message: string, status: number): this {
    this.mockHandler.handle.mockResolvedValue(queryFail(code, message, status));
    return this;
  }

  /**
   * Mock handler to return a not found error
   */
  returnsNotFound(message = 'Not found'): this {
    return this.returnsFailure(ErrorCodes.BOOK_NOT_FOUND, message, HttpStatus.NOT_FOUND);
  }

  /**
   * Mock handler to return a database error
   */
  returnsDatabaseError(message = 'Database error'): this {
    return this.returnsFailure(ErrorCodes.DATABASE_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * Get the underlying mock
   */
  build(): DeepMockProxy<IQueryHandler<TQuery, TResult>> {
    return this.mockHandler;
  }
}

/**
 * Create a new CommandHandlerMockBuilder
 */
export function buildCommandHandlerMock<TCommand extends ICommand, TResult>(
  mockHandler: DeepMockProxy<ICommandHandler<TCommand, TResult>>,
): CommandHandlerMockBuilder<TCommand, TResult> {
  return new CommandHandlerMockBuilder<TCommand, TResult>(mockHandler);
}

/**
 * Create a new QueryHandlerMockBuilder
 */
export function buildQueryHandlerMock<TQuery extends IQuery, TResult>(
  mockHandler: DeepMockProxy<IQueryHandler<TQuery, TResult>>,
): QueryHandlerMockBuilder<TQuery, TResult> {
  return new QueryHandlerMockBuilder<TQuery, TResult>(mockHandler);
}
