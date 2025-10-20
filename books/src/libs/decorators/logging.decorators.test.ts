import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';
import { LogOperation, CaptureContext, Observe } from './logging.decorators';
import { setGlobalLogger, getLoggerFromContext } from '@libs/logging/loggerAccessor';
import { ILogger } from '@libs/logging/logger.interface';
import { requestContextMiddleware } from '@middleware/requestContext';

describe('Logging Decorators', () => {
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    };
    setGlobalLogger(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('@LogOperation', () => {
    it('should log operation start and success', async () => {
      class TestController {
        logger = mockLogger;

        @LogOperation('TestOperation')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.json({ success: true });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Starting operation', expect.objectContaining({
        operation: 'TestOperation',
      }));
      expect(mockLogger.info).toHaveBeenCalledWith('Operation completed successfully', expect.objectContaining({
        operation: 'TestOperation',
        statusCode: 200,
        duration: expect.any(Number),
      }));
    });

    it('should auto-derive operation name from method name when not provided', async () => {
      class TestController {
        logger = mockLogger;

        @LogOperation()
        async getAuthors(_req: Request, res: Response): Promise<void> {
          res.json([]);
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await controller.getAuthors(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Starting operation', expect.objectContaining({
        operation: 'getAuthors',
      }));
    });

    it('should log error for 4xx status codes', async () => {
      class TestController {
        logger = mockLogger;

        @LogOperation('TestOperation')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.status(404).json({ error: 'Not found' });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.warn).toHaveBeenCalledWith('Operation completed with client error', expect.objectContaining({
        operation: 'TestOperation',
        statusCode: 404,
        duration: expect.any(Number),
      }));
    });

    it('should log error for 5xx status codes', async () => {
      class TestController {
        logger = mockLogger;

        @LogOperation('TestOperation')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.status(500).json({ error: 'Internal error' });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.error).toHaveBeenCalledWith('Operation failed', expect.objectContaining({
        operation: 'TestOperation',
        statusCode: 500,
        duration: expect.any(Number),
      }));
    });

    it('should log exception when method throws', async () => {
      class TestController {
        logger = mockLogger;

        @LogOperation('TestOperation')
        async testMethod(_req: Request, _res: Response): Promise<void> {
          throw new Error('Test error');
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await expect(controller.testMethod(req, res)).rejects.toThrow('Test error');

      expect(mockLogger.error).toHaveBeenCalledWith('Operation threw exception', expect.objectContaining({
        operation: 'TestOperation',
        error: 'Test error',
        duration: expect.any(Number),
      }));
    });

    it('should detect CQRS result failures', async () => {
      class TestController {
        logger = mockLogger;

        @LogOperation('TestOperation')
        async testMethod(_req: Request, res: Response): Promise<{ success: boolean; error?: { code: string; message: string; statusCode: number } }> {
          const result = {
            success: false as const,
            error: {
              code: 'DATABASE_ERROR',
              message: 'Database connection failed',
              statusCode: 500,
            },
          };
          res.status(500).json({ error: result.error.message });
          return result;
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.error).toHaveBeenCalledWith('Operation failed (CQRS)', expect.objectContaining({
        operation: 'TestOperation',
        code: 'DATABASE_ERROR',
        message: 'Database connection failed',
        statusCode: 500,
      }));
    });

    it('should use global logger when instance logger is not available', async () => {
      class TestController {
        @LogOperation('TestOperation')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.json({ success: true });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should integrate with request context', async () => {
      class TestController {
        logger = mockLogger;

        @LogOperation('TestOperation')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.json({ success: true });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest({
        headers: {
          'x-correlation-id': 'test-correlation-123',
        },
      });
      const res = httpMocks.createResponse();

      // Run within request context
      await new Promise<void>((resolve) => {
        requestContextMiddleware(req, res, async () => {
          await controller.testMethod(req, res);
          resolve();
        });
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Starting operation', expect.objectContaining({
        operation: 'TestOperation',
        correlationId: 'test-correlation-123',
      }));
    });
  });

  describe('@CaptureContext', () => {
    it('should capture context from request params', async () => {
      class TestController {
        logger = mockLogger;

        @CaptureContext('authorId', 'params', 'id')
        @LogOperation('GetAuthor')
        async testMethod(req: Request, res: Response): Promise<void> {
          res.json({ id: req.params.id });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest({
        params: { id: 'author-123' },
      });
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Starting operation', expect.objectContaining({
        operation: 'GetAuthor',
        authorId: 'author-123',
      }));
    });

    it('should capture context from request query', async () => {
      class TestController {
        logger = mockLogger;

        @CaptureContext('page', 'query', 'page')
        @LogOperation('GetList')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.json([]);
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest({
        query: { page: '2' },
      });
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Starting operation', expect.objectContaining({
        operation: 'GetList',
        page: '2',
      }));
    });

    it('should capture context from request body', async () => {
      class TestController {
        logger = mockLogger;

        @CaptureContext('email', 'body', 'email')
        @LogOperation('CreateUser')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.status(201).json({ success: true });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest({
        body: { email: 'test@example.com', name: 'Test User' },
      });
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Starting operation', expect.objectContaining({
        operation: 'CreateUser',
        email: 'test@example.com',
      }));
    });

    it('should capture multiple context fields', async () => {
      class TestController {
        logger = mockLogger;

        @CaptureContext('bookId', 'params', 'id')
        @CaptureContext('authorId', 'query', 'authorId')
        @LogOperation('GetBook')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.json({ success: true });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest({
        params: { id: 'book-456' },
        query: { authorId: 'author-123' },
      });
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Starting operation', expect.objectContaining({
        operation: 'GetBook',
        bookId: 'book-456',
        authorId: 'author-123',
      }));
    });

    it('should not include undefined context values', async () => {
      class TestController {
        logger = mockLogger;

        @CaptureContext('optionalField', 'query', 'optional')
        @LogOperation('TestOperation')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.json({ success: true });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest({
        query: {},
      });
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      const startCall = mockLogger.info.mock.calls.find(call => call[0] === 'Starting operation');
      expect(startCall?.[1]).not.toHaveProperty('optionalField');
    });
  });

  describe('@Observe', () => {
    it('should work as convenience decorator', async () => {
      class TestController {
        logger = mockLogger;

        @Observe('QuickOperation')
        async testMethod(_req: Request, res: Response): Promise<void> {
          res.json({ success: true });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await controller.testMethod(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Starting operation', expect.objectContaining({
        operation: 'QuickOperation',
      }));
      expect(mockLogger.info).toHaveBeenCalledWith('Operation completed successfully', expect.objectContaining({
        operation: 'QuickOperation',
      }));
    });

    it('should auto-derive operation name when not provided', async () => {
      class TestController {
        logger = mockLogger;

        @Observe()
        async myMethod(_req: Request, res: Response): Promise<void> {
          res.json({ success: true });
        }
      }

      const controller = new TestController();
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await controller.myMethod(req, res);

      expect(mockLogger.info).toHaveBeenCalledWith('Starting operation', expect.objectContaining({
        operation: 'myMethod',
      }));
    });
  });

  describe('getLoggerFromContext', () => {
    it('should return instance logger when available', () => {
      const instanceLogger: ILogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        child: jest.fn(),
      };

      const context = { logger: instanceLogger };
      const result = getLoggerFromContext(context);

      expect(result).toBe(instanceLogger);
    });

    it('should return global logger when instance logger not available', () => {
      const context = {};
      const result = getLoggerFromContext(context);

      expect(result).toBe(mockLogger);
    });

    it('should return global logger when context is null', () => {
      const result = getLoggerFromContext(null);
      expect(result).toBe(mockLogger);
    });
  });
});
