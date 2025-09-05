import { Request, Response, NextFunction } from 'express';
import { mock } from 'jest-mock-extended';

import { ILogger } from '@libs/logging/logger.interface';

import container from '../libs/ioc.container';

import { errorHandler, AppError } from './errorHandler';

// Mock the container
jest.mock('../libs/ioc.container', () => ({
  get: jest.fn(),
}));

describe('errorHandler middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    req = {
      path: '/api/v1/books',
      method: 'GET',
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    mockLogger = mock<ILogger>();
    (container.get as jest.Mock).mockReturnValue(mockLogger);
  });

  it('should respond with error details using provided error status in non-development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'QA';

    const error: AppError = new Error('Test error');
    error.status = 400;
    error.stack = 'dummy stack trace';

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      message: 'Test error',
    });
    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error in request', {
      error: 'Test error',
      stack: 'dummy stack trace',
      statusCode: 400,
      path: '/api/v1/books',
      method: 'GET',
      correlationId: 'unknown',
    });
    process.env.NODE_ENV = originalEnv;
  });

  it('should default to status 500 when error.status is undefined', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'QA';

    const error: AppError = new Error('No status error');
    error.stack = 'dummy stack';

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: 'No status error',
    });
    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error in request', {
      error: 'No status error',
      stack: 'dummy stack',
      statusCode: 500,
      path: '/api/v1/books',
      method: 'GET',
      correlationId: 'unknown',
    });
    process.env.NODE_ENV = originalEnv;
  });

  it('should include stack trace in response in development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error: AppError = new Error('Dev error');
    error.status = 403;
    error.stack = 'dev stack trace';

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 403,
      message: 'Dev error',
      stack: 'dev stack trace',
    });
    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error in request', {
      error: 'Dev error',
      stack: 'dev stack trace',
      statusCode: 403,
      path: '/api/v1/books',
      method: 'GET',
      correlationId: 'unknown',
    });
    process.env.NODE_ENV = originalEnv;
  });

  it('should set an empty stack string when error.stack is undefined in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error: AppError = new Error('Error with no stack');
    error.status = 404;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error.stack = undefined as any;

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Error with no stack',
      stack: '',
    });
    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error in request', {
      error: 'Error with no stack',
      stack: undefined,
      statusCode: 404,
      path: '/api/v1/books',
      method: 'GET',
      correlationId: 'unknown',
    });
    process.env.NODE_ENV = originalEnv;
  });

  it('should fall back to the default error message when error.message is empty', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'Prod';

    const error: AppError = new Error('Fallback error message test');
    error.message = '';
    error.stack = 'some stack';

    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: 'Internal Server Error',
    });
    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error in request', {
      error: '',
      stack: 'some stack',
      statusCode: 500,
      path: '/api/v1/books',
      method: 'GET',
      correlationId: 'unknown',
    });
    process.env.NODE_ENV = originalEnv;
  });

  it('should use correlation ID from request headers when available', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'QA';

    const error: AppError = new Error('Test error with correlation ID');
    error.status = 500;
    error.stack = 'test stack';

    req.headers = { 'x-correlation-id': 'test-correlation-123' };

    errorHandler(error, req as Request, res as Response, next);

    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error in request', {
      error: 'Test error with correlation ID',
      stack: 'test stack',
      statusCode: 500,
      path: '/api/v1/books',
      method: 'GET',
      correlationId: 'test-correlation-123',
    });
    process.env.NODE_ENV = originalEnv;
  });

  it('should not call next()', () => {
    const error: AppError = new Error('No next call');
    errorHandler(error, req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
  });
});
