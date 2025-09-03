import { NextFunction } from 'express';
import httpMocks from 'node-mocks-http';
import { requestContextMiddleware, getRequestContext, asyncLocalStorage } from './requestContext';

describe('requestContext', () => {
  let mockNext: NextFunction;

  beforeEach(() => {
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestContextMiddleware', () => {
    it('should create context with correlation ID from header', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
        headers: {
          'x-correlation-id': 'test-correlation-id',
        },
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.getHeader('X-Correlation-Id')).toBe('test-correlation-id');
      expect(res.getHeader('X-Request-Id')).toBeDefined();
    });

    it('should generate correlation ID when not provided in header', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.getHeader('X-Correlation-Id')).toBeDefined();
      expect(res.getHeader('X-Request-Id')).toBeDefined();
    });

    it('should capture basic request metadata', () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        path: '/api/test',
        headers: {
          'user-agent': 'test-agent',
        },
        ip: '127.0.0.1',
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context).toBeDefined();
        expect(context?.method).toBe('POST');
        expect(context?.path).toBe('/api/test');
        expect(context?.clientIp).toBe('127.0.0.1');
        expect(context?.userAgent).toBe('test-agent');
        expect(context?.timestamp).toBeInstanceOf(Date);
      });
    });

    it('should extract user context from JWT token with oid', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
        user: {
          oid: 'user-object-id',
          preferred_username: 'test@example.com',
          name: 'Test User',
          upn: 'test@example.com',
          tid: 'tenant-id',
        },
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context?.userId).toBe('user-object-id');
        expect(context?.userName).toBe('test@example.com');
        expect(context?.userEmail).toBe('test@example.com');
        expect(context?.tenantId).toBe('tenant-id');
      });
    });

    it('should extract user context from JWT token with sub when oid missing', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
        user: {
          sub: 'user-subject-id',
          name: 'Test User',
          upn: 'test@example.com',
        },
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context?.userId).toBe('user-subject-id');
        expect(context?.userName).toBe('Test User');
        expect(context?.userEmail).toBe('test@example.com');
      });
    });

    it('should extract email from custom property', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
        user: {
          oid: 'user-id',
          email: 'custom@example.com',
        },
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context?.userEmail).toBe('custom@example.com');
      });
    });

    it('should extract roles from authInfo', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
        authInfo: {
          roles: ['Admin', 'Reader'],
        },
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context?.roles).toEqual(['Admin', 'Reader']);
      });
    });

    it('should extract and parse scopes from authInfo', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
        authInfo: {
          scp: 'read write delete',
        },
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context?.scopes).toEqual(['read', 'write', 'delete']);
      });
    });

    it('should handle request without user context', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context?.userId).toBeUndefined();
        expect(context?.userName).toBeUndefined();
        expect(context?.userEmail).toBeUndefined();
        expect(context?.roles).toBeUndefined();
        expect(context?.scopes).toBeUndefined();
      });
    });

    it('should handle request without clientIp', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
      });
      // Remove ip - socket.remoteAddress will be undefined by default
      delete (req as { ip?: string }).ip;

      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context?.clientIp).toBeUndefined();
      });
    });

    it('should handle request without user-agent header', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context?.userAgent).toBeUndefined();
      });
    });

    it('should fallback to socket.remoteAddress when ip is missing', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
      });
      delete (req as { ip?: string }).ip;
      (req.socket as { remoteAddress?: string }).remoteAddress = '192.168.1.1';

      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context?.clientIp).toBe('192.168.1.1');
      });
    });

    it('should handle complete authenticated request', () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        path: '/api/books',
        headers: {
          'x-correlation-id': 'existing-correlation',
          'user-agent': 'Mozilla/5.0',
        },
        ip: '10.0.0.1',
        user: {
          oid: 'abc123',
          preferred_username: 'john.doe@example.com',
          name: 'John Doe',
          email: 'john@example.com',
          tid: 'tenant-123',
        },
        authInfo: {
          roles: ['Admin', 'Writer'],
          scp: 'books.read books.write',
        },
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();

        expect(context).toMatchObject({
          correlationId: 'existing-correlation',
          method: 'POST',
          path: '/api/books',
          userId: 'abc123',
          userName: 'john.doe@example.com',
          userEmail: 'john@example.com',
          tenantId: 'tenant-123',
          clientIp: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
          roles: ['Admin', 'Writer'],
          scopes: ['books.read', 'books.write'],
        });
        expect(context?.requestId).toBeDefined();
        expect(context?.timestamp).toBeInstanceOf(Date);
        expect(res.getHeader('X-Correlation-Id')).toBe('existing-correlation');
        expect(res.getHeader('X-Request-Id')).toBeDefined();
      });
    });
  });

  describe('getRequestContext', () => {
    it('should return undefined when called outside request context', () => {
      const context = getRequestContext();
      expect(context).toBeUndefined();
    });

    it('should return context when called within request context', () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/test',
      });
      const res = httpMocks.createResponse();

      requestContextMiddleware(req, res, (err) => {
        if (err) throw err;
        const context = getRequestContext();
        expect(context).toBeDefined();
        expect(context?.method).toBe('GET');
        expect(context?.path).toBe('/test');
      });
    });

    it('should maintain context across async operations', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        path: '/async-test',
        headers: {
          'x-correlation-id': 'async-test-id',
        },
      });
      const res = httpMocks.createResponse();

      await new Promise<void>((resolve) => {
        requestContextMiddleware(req, res, async (err) => {
          if (err) throw err;

          // Simulate async operation
          await new Promise((r) => setTimeout(r, 10));

          const context = getRequestContext();
          expect(context).toBeDefined();
          expect(context?.correlationId).toBe('async-test-id');
          expect(context?.path).toBe('/async-test');

          resolve();
        });
      });
    });
  });

  describe('asyncLocalStorage', () => {
    it('should be properly exported and usable', () => {
      expect(asyncLocalStorage).toBeDefined();
      expect(typeof asyncLocalStorage.run).toBe('function');
      expect(typeof asyncLocalStorage.getStore).toBe('function');
    });
  });
});
