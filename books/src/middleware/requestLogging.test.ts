import { NextFunction } from 'express';
import httpMocks from 'node-mocks-http';
import { createRequestLoggingMiddleware } from './requestLogging';
import { requestContextMiddleware } from './requestContext';
import { ILogger } from '../libs/logging/logger.interface';

describe('requestLogging', () => {
  let mockLogger: jest.Mocked<ILogger>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequestLoggingMiddleware', () => {
    it('should return a middleware function', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('should log incoming request with basic metadata', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        path: '/api/test',
        query: undefined,
        correlationId: undefined,
        userId: undefined,
        userName: undefined,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log incoming request with query parameters', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/books',
        query: { page: '1', limit: '10' },
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        path: '/api/books',
        query: { page: '1', limit: '10' },
        correlationId: undefined,
        userId: undefined,
        userName: undefined,
      });
    });

    it('should not include query in log when empty', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test',
        query: {},
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        path: '/api/test',
        query: undefined,
        correlationId: undefined,
        userId: undefined,
        userName: undefined,
      });
    });

    it('should log request with context from requestContextMiddleware', () => {
      const loggingMiddleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'POST',
        path: '/api/authors',
        headers: {
          'x-correlation-id': 'test-correlation',
        },
        user: {
          oid: 'user-123',
          preferred_username: 'test@example.com',
        },
      });
      const res = httpMocks.createResponse();

      // Apply request context middleware first, then logging middleware
      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        loggingMiddleware(req, res, mockNext);

        expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
          method: 'POST',
          path: '/api/authors',
          query: undefined,
          correlationId: 'test-correlation',
          userId: 'user-123',
          userName: 'test@example.com',
        });
      });
    });

    it('should log successful completion with status 200', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      // Simulate successful response
      res.statusCode = 200;
      res.end();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          method: 'GET',
          path: '/api/test',
          statusCode: 200,
          duration: expect.any(Number),
          correlationId: undefined,
          userId: undefined,
          userName: undefined,
        })
      );
      expect(mockLogger.info).toHaveBeenCalledTimes(2); // incoming + completed
    });

    it('should log completion with status 201', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'POST',
        path: '/api/authors',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 201;
      res.end();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 201,
        })
      );
    });

    it('should log warning for 4xx status codes', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 404;
      res.end();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          method: 'GET',
          path: '/api/test',
          statusCode: 404,
          duration: expect.any(Number),
        })
      );
    });

    it('should log warning for status 400', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'POST',
        path: '/api/books',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 400;
      res.end();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 400,
        })
      );
    });

    it('should log warning for status 401', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/protected',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 401;
      res.end();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 401,
        })
      );
    });

    it('should log warning for status 403', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'DELETE',
        path: '/api/books/123',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 403;
      res.end();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });

    it('should log error for 5xx status codes', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 500;
      res.end();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          method: 'GET',
          path: '/api/test',
          statusCode: 500,
          duration: expect.any(Number),
        })
      );
    });

    it('should log error for status 502', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'POST',
        path: '/api/external',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 502;
      res.end();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 502,
        })
      );
    });

    it('should log error for status 503', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/health',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 503;
      res.end();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 503,
        })
      );
    });

    it('should calculate request duration accurately', (done) => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      // Simulate delay before response
      setTimeout(() => {
        res.statusCode = 200;
        res.end();

        const completionCall = mockLogger.info.mock.calls.find(
          (call) => call[0] === 'Request completed'
        );
        expect(completionCall).toBeDefined();
        if (completionCall?.[1]) {
          const duration = completionCall[1].duration as number;
          expect(duration).toBeGreaterThanOrEqual(50);
          expect(duration).toBeLessThan(200); // Allow some tolerance
        }
        done();
      }, 50);
    });

    it('should include context in completion log', () => {
      const loggingMiddleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'PUT',
        path: '/api/books/123',
        headers: {
          'x-correlation-id': 'update-correlation',
        },
        user: {
          oid: 'updater-123',
          preferred_username: 'updater@example.com',
        },
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        loggingMiddleware(req, res, mockNext);

        res.statusCode = 200;
        res.end();

        expect(mockLogger.info).toHaveBeenCalledWith(
          'Request completed',
          expect.objectContaining({
            method: 'PUT',
            path: '/api/books/123',
            statusCode: 200,
            correlationId: 'update-correlation',
            userId: 'updater-123',
            userName: 'updater@example.com',
            duration: expect.any(Number),
          })
        );
      });
    });

    it('should handle res.end with arguments', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 200;
      res.end('response body');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 200,
        })
      );
    });

    it('should handle res.end with buffer', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 200;
      res.end(Buffer.from('test'));

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 200,
        })
      );
    });

    it('should handle multiple requests independently', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);

      // First request
      const req1 = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test1',
      });
      const res1 = httpMocks.createResponse();

      // Second request
      const req2 = httpMocks.createRequest({
        method: 'POST',
        path: '/api/test2',
      });
      const res2 = httpMocks.createResponse();

      middleware(req1, res1, mockNext);
      middleware(req2, res2, mockNext);

      res1.statusCode = 200;
      res1.end();

      res2.statusCode = 201;
      res2.end();

      // Verify first request
      const req1Completion = mockLogger.info.mock.calls.find(
        (call) => call[0] === 'Request completed' && call[1]?.path === '/api/test1'
      );
      expect(req1Completion).toBeDefined();
      expect(req1Completion?.[1]?.statusCode).toBe(200);

      // Verify second request
      const req2Completion = mockLogger.info.mock.calls.find(
        (call) => call[0] === 'Request completed' && call[1]?.path === '/api/test2'
      );
      expect(req2Completion).toBeDefined();
      expect(req2Completion?.[1]?.statusCode).toBe(201);

      // Should have 4 info calls total: 2 incoming + 2 completed
      expect(mockLogger.info).toHaveBeenCalledTimes(4);
    });

    it('should call original res.end function', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/test',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 200;
      res.end();

      // Verify that res.end was actually called and response is finished
      expect(res.finished).toBe(true);
      expect(res.writableEnded).toBe(true);
    });

    it('should handle status code 304 (not modified) as info', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/cached',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 304;
      res.end();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 304,
        })
      );
    });

    it('should handle status code 204 (no content) as info', () => {
      const middleware = createRequestLoggingMiddleware(mockLogger);
      const req = httpMocks.createRequest({
        method: 'DELETE',
        path: '/api/books/123',
      });
      const res = httpMocks.createResponse();

      middleware(req, res, mockNext);

      res.statusCode = 204;
      res.end();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Request completed',
        expect.objectContaining({
          statusCode: 204,
        })
      );
    });
  });
});
