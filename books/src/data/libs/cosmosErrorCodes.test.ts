import {
  CosmosStatusCodes,
  CosmosErrorCategory,
  ErrorCategoryMap,
  ErrorMessageMap,
  isRetryableError,
  getErrorCategory,
  getErrorMessage,
} from './cosmosErrorCodes';

describe('cosmosErrorCodes', () => {
  describe('CosmosStatusCodes', () => {
    it('should define standard HTTP status codes', () => {
      expect(CosmosStatusCodes.OK).toBe(200);
      expect(CosmosStatusCodes.CREATED).toBe(201);
      expect(CosmosStatusCodes.NO_CONTENT).toBe(204);
      expect(CosmosStatusCodes.NOT_MODIFIED).toBe(304);
    });

    it('should define client error codes', () => {
      expect(CosmosStatusCodes.BAD_REQUEST).toBe(400);
      expect(CosmosStatusCodes.UNAUTHORIZED).toBe(401);
      expect(CosmosStatusCodes.FORBIDDEN).toBe(403);
      expect(CosmosStatusCodes.NOT_FOUND).toBe(404);
    });

    it('should define Cosmos-specific error codes', () => {
      expect(CosmosStatusCodes.REQUEST_TIMEOUT).toBe(408);
      expect(CosmosStatusCodes.CONFLICT).toBe(409);
      expect(CosmosStatusCodes.PRECONDITION_FAILED).toBe(412);
      expect(CosmosStatusCodes.REQUEST_ENTITY_TOO_LARGE).toBe(413);
      expect(CosmosStatusCodes.TOO_MANY_REQUESTS).toBe(429);
      expect(CosmosStatusCodes.RETRY_WITH).toBe(449);
    });

    it('should define server error codes', () => {
      expect(CosmosStatusCodes.INTERNAL_SERVER_ERROR).toBe(500);
      expect(CosmosStatusCodes.SERVICE_UNAVAILABLE).toBe(503);
    });
  });

  describe('ErrorCategoryMap', () => {
    it('should categorize client errors correctly', () => {
      expect(ErrorCategoryMap[400]).toBe(CosmosErrorCategory.CLIENT_ERROR);
      expect(ErrorCategoryMap[413]).toBe(CosmosErrorCategory.CLIENT_ERROR);
    });

    it('should categorize authentication errors correctly', () => {
      expect(ErrorCategoryMap[401]).toBe(CosmosErrorCategory.AUTHENTICATION);
      expect(ErrorCategoryMap[403]).toBe(CosmosErrorCategory.AUTHENTICATION);
    });

    it('should categorize permanent errors correctly', () => {
      expect(ErrorCategoryMap[404]).toBe(CosmosErrorCategory.PERMANENT);
      expect(ErrorCategoryMap[409]).toBe(CosmosErrorCategory.PERMANENT);
      expect(ErrorCategoryMap[412]).toBe(CosmosErrorCategory.PERMANENT);
    });

    it('should categorize retryable errors correctly', () => {
      expect(ErrorCategoryMap[408]).toBe(CosmosErrorCategory.RETRYABLE);
      expect(ErrorCategoryMap[429]).toBe(CosmosErrorCategory.RETRYABLE);
      expect(ErrorCategoryMap[449]).toBe(CosmosErrorCategory.RETRYABLE);
      expect(ErrorCategoryMap[503]).toBe(CosmosErrorCategory.RETRYABLE);
    });

    it('should categorize service errors correctly', () => {
      expect(ErrorCategoryMap[500]).toBe(CosmosErrorCategory.SERVICE_ERROR);
    });
  });

  describe('ErrorMessageMap', () => {
    it('should provide descriptive messages for all categorized errors', () => {
      // Verify every status code in ErrorCategoryMap has a corresponding message
      Object.keys(ErrorCategoryMap).forEach((statusCode) => {
        const code = Number(statusCode);
        expect(ErrorMessageMap[code]).toBeDefined();
        expect(ErrorMessageMap[code]).not.toBe('');
        expect(typeof ErrorMessageMap[code]).toBe('string');
      });
    });

    it('should have meaningful messages for common errors', () => {
      expect(ErrorMessageMap[404]).toContain('not found');
      expect(ErrorMessageMap[409]).toContain('already exists');
      expect(ErrorMessageMap[429]).toContain('throttled');
      expect(ErrorMessageMap[503]).toContain('unavailable');
    });
  });

  describe('isRetryableError', () => {
    it('should return true for retryable status codes', () => {
      expect(isRetryableError(408)).toBe(true); // Request timeout
      expect(isRetryableError(429)).toBe(true); // Too many requests
      expect(isRetryableError(449)).toBe(true); // Retry with
      expect(isRetryableError(503)).toBe(true); // Service unavailable
    });

    it('should return false for non-retryable status codes', () => {
      expect(isRetryableError(400)).toBe(false); // Bad request
      expect(isRetryableError(401)).toBe(false); // Unauthorized
      expect(isRetryableError(403)).toBe(false); // Forbidden
      expect(isRetryableError(404)).toBe(false); // Not found
      expect(isRetryableError(409)).toBe(false); // Conflict
      expect(isRetryableError(412)).toBe(false); // Precondition failed
      expect(isRetryableError(413)).toBe(false); // Entity too large
      expect(isRetryableError(500)).toBe(false); // Internal server error
    });

    it('should return false for unknown status codes', () => {
      expect(isRetryableError(999)).toBe(false);
      expect(isRetryableError(123)).toBe(false);
    });
  });

  describe('getErrorCategory', () => {
    it('should return correct category for known status codes', () => {
      expect(getErrorCategory(400)).toBe(CosmosErrorCategory.CLIENT_ERROR);
      expect(getErrorCategory(401)).toBe(CosmosErrorCategory.AUTHENTICATION);
      expect(getErrorCategory(404)).toBe(CosmosErrorCategory.PERMANENT);
      expect(getErrorCategory(429)).toBe(CosmosErrorCategory.RETRYABLE);
      expect(getErrorCategory(500)).toBe(CosmosErrorCategory.SERVICE_ERROR);
    });

    it('should return SERVICE_ERROR for unknown status codes', () => {
      expect(getErrorCategory(999)).toBe(CosmosErrorCategory.SERVICE_ERROR);
      expect(getErrorCategory(123)).toBe(CosmosErrorCategory.SERVICE_ERROR);
      expect(getErrorCategory(0)).toBe(CosmosErrorCategory.SERVICE_ERROR);
    });
  });

  describe('getErrorMessage', () => {
    it('should return descriptive messages for known status codes', () => {
      const message404 = getErrorMessage(404);
      expect(message404).toBe('Resource not found');

      const message429 = getErrorMessage(429);
      expect(message429).toContain('throttled');

      const message409 = getErrorMessage(409);
      expect(message409).toContain('already exists');
    });

    it('should return generic message for unknown status codes', () => {
      const message = getErrorMessage(999);
      expect(message).toBe('An unexpected error occurred');
    });

    it('should never return undefined or empty string', () => {
      expect(getErrorMessage(999)).toBeTruthy();
      expect(getErrorMessage(0)).toBeTruthy();
      expect(getErrorMessage(-1)).toBeTruthy();
    });
  });

  describe('consistency checks', () => {
    it('should have ErrorMessageMap entry for every ErrorCategoryMap entry', () => {
      Object.keys(ErrorCategoryMap).forEach((statusCode) => {
        const code = Number(statusCode);
        expect(ErrorMessageMap[code]).toBeDefined();
      });
    });

    it('should have ErrorCategoryMap entry for every ErrorMessageMap entry', () => {
      Object.keys(ErrorMessageMap).forEach((statusCode) => {
        const code = Number(statusCode);
        expect(ErrorCategoryMap[code]).toBeDefined();
      });
    });

    it('should have all retryable errors in the RETRYABLE category', () => {
      Object.entries(ErrorCategoryMap).forEach(([statusCode, category]) => {
        const code = Number(statusCode);
        const isRetryable = isRetryableError(code);
        if (category === CosmosErrorCategory.RETRYABLE) {
          expect(isRetryable).toBe(true);
        } else {
          expect(isRetryable).toBe(false);
        }
      });
    });
  });
});
