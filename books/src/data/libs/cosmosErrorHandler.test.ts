import { CosmosStatusCodes, CosmosErrorCategory } from './cosmosErrorCodes';
import {
  extractStatusCode,
  extractRequestCharge,
  extractActivityId,
  createErrorContext,
  formatErrorForLogging,
  sanitizeErrorForClient,
} from './cosmosErrorHandler';

describe('cosmosErrorHandler', () => {
  describe('extractStatusCode', () => {
    it('should extract status code from error.code property', () => {
      const error = { code: 404 };
      expect(extractStatusCode(error)).toBe(404);
    });

    it('should extract status code from error.statusCode property', () => {
      const error = { statusCode: 409 };
      expect(extractStatusCode(error)).toBe(409);
    });

    it('should extract status code from error.status property', () => {
      const error = { status: 429 };
      expect(extractStatusCode(error)).toBe(429);
    });

    it('should prioritize code over statusCode and status', () => {
      const error = { code: 404, statusCode: 500, status: 400 };
      expect(extractStatusCode(error)).toBe(404);
    });

    it('should return 500 for non-object errors', () => {
      expect(extractStatusCode('error string')).toBe(500);
      expect(extractStatusCode(null)).toBe(500);
      expect(extractStatusCode(undefined)).toBe(500);
      expect(extractStatusCode(123)).toBe(500);
    });

    it('should return 500 when no status code property found', () => {
      const error = { message: 'Something went wrong' };
      expect(extractStatusCode(error)).toBe(500);
    });
  });

  describe('extractRequestCharge', () => {
    it('should extract request charge from error.requestCharge property', () => {
      const error = { requestCharge: 5.5 };
      expect(extractRequestCharge(error)).toBe(5.5);
    });

    it('should extract request charge from headers object (number)', () => {
      const error = {
        headers: {
          'x-ms-request-charge': 3.2,
        },
      };
      expect(extractRequestCharge(error)).toBe(3.2);
    });

    it('should extract request charge from headers object (string)', () => {
      const error = {
        headers: {
          'x-ms-request-charge': '7.8',
        },
      };
      expect(extractRequestCharge(error)).toBe(7.8);
    });

    it('should return undefined for invalid string charge', () => {
      const error = {
        headers: {
          'x-ms-request-charge': 'invalid',
        },
      };
      expect(extractRequestCharge(error)).toBeUndefined();
    });

    it('should return undefined for non-object errors', () => {
      expect(extractRequestCharge('error')).toBeUndefined();
      expect(extractRequestCharge(null)).toBeUndefined();
      expect(extractRequestCharge(undefined)).toBeUndefined();
    });

    it('should return undefined when no request charge found', () => {
      const error = { code: 404 };
      expect(extractRequestCharge(error)).toBeUndefined();
    });
  });

  describe('extractActivityId', () => {
    it('should extract activity ID from error.activityId property', () => {
      const error = { activityId: 'abc-123-def' };
      expect(extractActivityId(error)).toBe('abc-123-def');
    });

    it('should extract activity ID from headers object', () => {
      const error = {
        headers: {
          'x-ms-activity-id': 'xyz-789-uvw',
        },
      };
      expect(extractActivityId(error)).toBe('xyz-789-uvw');
    });

    it('should return undefined for non-object errors', () => {
      expect(extractActivityId('error')).toBeUndefined();
      expect(extractActivityId(null)).toBeUndefined();
      expect(extractActivityId(undefined)).toBeUndefined();
    });

    it('should return undefined when no activity ID found', () => {
      const error = { code: 404 };
      expect(extractActivityId(error)).toBeUndefined();
    });
  });

  describe('createErrorContext', () => {
    it('should create context for a 404 error', () => {
      const error = { code: 404, message: 'Not found' };
      const context = createErrorContext(error, 'getById', 'book');

      expect(context.operation).toBe('getById');
      expect(context.entityType).toBe('book');
      expect(context.statusCode).toBe(404);
      expect(context.category).toBe(CosmosErrorCategory.PERMANENT);
      expect(context.message).toContain('not found');
      expect(context.isRetryable).toBe(false);
    });

    it('should create context for a 429 rate limit error', () => {
      const error = {
        code: 429,
        message: 'Request rate too large',
        requestCharge: 10.5,
      };
      const context = createErrorContext(error, 'create', 'author');

      expect(context.operation).toBe('create');
      expect(context.entityType).toBe('author');
      expect(context.statusCode).toBe(429);
      expect(context.category).toBe(CosmosErrorCategory.RETRYABLE);
      expect(context.isRetryable).toBe(true);
      expect(context.requestCharge).toBe(10.5);
    });

    it('should include activity ID when available', () => {
      const error = {
        code: 500,
        activityId: 'test-activity-123',
      };
      const context = createErrorContext(error, 'update', 'book');

      expect(context.activityId).toBe('test-activity-123');
    });

    it('should preserve original error message', () => {
      const error = {
        code: 400,
        message: 'Detailed technical error message',
      };
      const context = createErrorContext(error, 'query', 'book');

      expect(context.originalMessage).toBe('Detailed technical error message');
      expect(context.message).not.toBe(context.originalMessage); // Should be sanitized
    });

    it('should handle string errors gracefully', () => {
      const error = 'Simple error string';
      const context = createErrorContext(error, 'delete', 'author');

      expect(context.statusCode).toBe(CosmosStatusCodes.INTERNAL_SERVER_ERROR);
      expect(context.operation).toBe('delete');
      expect(context.entityType).toBe('author');
      expect(context.originalMessage).toBe('Simple error string');
    });

    it('should mark retryable errors correctly', () => {
      const retryableError = { code: 408 }; // Request timeout
      const retryableContext = createErrorContext(retryableError, 'getAll', 'book');
      expect(retryableContext.isRetryable).toBe(true);

      const permanentError = { code: 409 }; // Conflict
      const permanentContext = createErrorContext(permanentError, 'create', 'book');
      expect(permanentContext.isRetryable).toBe(false);
    });
  });

  describe('formatErrorForLogging', () => {
    it('should format basic error context', () => {
      const context = createErrorContext({ code: 404 }, 'getById', 'book');
      const formatted = formatErrorForLogging(context);

      expect(formatted).toContain('[getById]');
      expect(formatted).toContain('Entity: book');
      expect(formatted).toContain('Status: 404');
      expect(formatted).toContain('Category: PERMANENT');
    });

    it('should include request charge when available', () => {
      const context = createErrorContext(
        { code: 429, requestCharge: 15.2 },
        'query',
        'author'
      );
      const formatted = formatErrorForLogging(context);

      expect(formatted).toContain('RU/s: 15.2');
    });

    it('should include activity ID when available', () => {
      const context = createErrorContext(
        { code: 500, activityId: 'abc-123' },
        'update',
        'book'
      );
      const formatted = formatErrorForLogging(context);

      expect(formatted).toContain('ActivityId: abc-123');
    });

    it('should indicate retryable errors', () => {
      const context = createErrorContext({ code: 429 }, 'create', 'book');
      const formatted = formatErrorForLogging(context);

      expect(formatted).toContain('(Retryable)');
    });

    it('should include original message when different from sanitized message', () => {
      const error = { code: 400, message: 'Detailed SQL error' };
      const context = createErrorContext(error, 'query', 'book');
      const formatted = formatErrorForLogging(context);

      expect(formatted).toContain('Original:');
      expect(formatted).toContain('Detailed SQL error');
    });

    it('should not duplicate message when original equals sanitized', () => {
      const error = { code: 404, message: 'Resource not found' };
      const context = createErrorContext(error, 'getById', 'book');
      const formatted = formatErrorForLogging(context);

      // Should not have "Original:" since messages are the same
      const originalCount = (formatted.match(/Original:/g) || []).length;
      expect(originalCount).toBe(0);
    });
  });

  describe('sanitizeErrorForClient', () => {
    it('should return generic message for service errors', () => {
      const context = createErrorContext(
        { code: CosmosStatusCodes.INTERNAL_SERVER_ERROR },
        'update',
        'book'
      );
      const sanitized = sanitizeErrorForClient(context);

      expect(sanitized).toBe('Failed to update book');
      expect(sanitized).not.toContain('Internal server error');
    });

    it('should return specific message for client errors', () => {
      const context = createErrorContext({ code: 400 }, 'create', 'author');
      const sanitized = sanitizeErrorForClient(context);

      expect(sanitized).toContain('Invalid request');
    });

    it('should return specific message for authentication errors', () => {
      const context = createErrorContext({ code: 401 }, 'getAll', 'book');
      const sanitized = sanitizeErrorForClient(context);

      expect(sanitized).toContain('Authentication');
    });

    it('should return specific message for permanent errors', () => {
      const context = createErrorContext({ code: 404 }, 'getById', 'book');
      const sanitized = sanitizeErrorForClient(context);

      expect(sanitized).toContain('not found');
    });

    it('should return specific message for retryable errors', () => {
      const context = createErrorContext({ code: 429 }, 'query', 'author');
      const sanitized = sanitizeErrorForClient(context);

      expect(sanitized).toContain('throttled');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete Cosmos DB error object', () => {
      const cosmosError = {
        code: 429,
        statusCode: 429,
        message: 'Request rate is large',
        requestCharge: 25.7,
        activityId: 'e5f8a9b2-c3d4-4e5f-a6b7-c8d9e0f1a2b3',
        headers: {
          'x-ms-request-charge': '25.7',
          'x-ms-activity-id': 'e5f8a9b2-c3d4-4e5f-a6b7-c8d9e0f1a2b3',
        },
      };

      const context = createErrorContext(cosmosError, 'getAllPaginated', 'book');

      expect(context.statusCode).toBe(429);
      expect(context.isRetryable).toBe(true);
      expect(context.requestCharge).toBe(25.7);
      expect(context.activityId).toBe('e5f8a9b2-c3d4-4e5f-a6b7-c8d9e0f1a2b3');

      const logMessage = formatErrorForLogging(context);
      expect(logMessage).toContain('RU/s');
      expect(logMessage).toContain('ActivityId');
      expect(logMessage).toContain('(Retryable)');

      const clientMessage = sanitizeErrorForClient(context);
      expect(clientMessage).toBeTruthy();
      expect(clientMessage).not.toContain('e5f8a9b2'); // No activity ID in client message
    });
  });
});
