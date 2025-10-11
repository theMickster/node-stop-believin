import {
  isErrorWithMessage,
  isErrorWithCode,
  isErrorWithStatus,
  getErrorMessage,
  toErrorObject,
} from './errorGuards';

describe('errorGuards', () => {
  describe('isErrorWithMessage', () => {
    it('should return true for standard Error objects', () => {
      const error = new Error('Test error');
      expect(isErrorWithMessage(error)).toBe(true);
    });

    it('should return true for custom error objects with message', () => {
      const error = { message: 'Custom error' };
      expect(isErrorWithMessage(error)).toBe(true);
    });

    it('should return false for objects without message property', () => {
      const error = { code: 404 };
      expect(isErrorWithMessage(error)).toBe(false);
    });

    it('should return false for objects with non-string message', () => {
      const error = { message: 123 };
      expect(isErrorWithMessage(error)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isErrorWithMessage(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isErrorWithMessage(undefined)).toBe(false);
    });

    it('should return false for strings', () => {
      expect(isErrorWithMessage('error string')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(isErrorWithMessage(42)).toBe(false);
    });

    it('should return false for empty objects', () => {
      expect(isErrorWithMessage({})).toBe(false);
    });
  });

  describe('isErrorWithCode', () => {
    it('should return true for objects with numeric code', () => {
      const error = { code: 404 };
      expect(isErrorWithCode(error)).toBe(true);
    });

    it('should return true for Cosmos DB error-like objects', () => {
      const error = { code: 404, message: 'Not found' };
      expect(isErrorWithCode(error)).toBe(true);
    });

    it('should return false for objects with string code', () => {
      const error = { code: 'NOT_FOUND' };
      expect(isErrorWithCode(error)).toBe(false);
    });

    it('should return false for objects without code property', () => {
      const error = { message: 'Error' };
      expect(isErrorWithCode(error)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isErrorWithCode(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isErrorWithCode(undefined)).toBe(false);
    });

    it('should return false for strings', () => {
      expect(isErrorWithCode('error')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(isErrorWithCode(500)).toBe(false);
    });
  });

  describe('isErrorWithStatus', () => {
    it('should return true for objects with numeric status', () => {
      const error = { status: 401 };
      expect(isErrorWithStatus(error)).toBe(true);
    });

    it('should return true for HTTP error-like objects', () => {
      const error = { status: 500, message: 'Internal Server Error' };
      expect(isErrorWithStatus(error)).toBe(true);
    });

    it('should return false for objects with string status', () => {
      const error = { status: 'error' };
      expect(isErrorWithStatus(error)).toBe(false);
    });

    it('should return false for objects without status property', () => {
      const error = { message: 'Error' };
      expect(isErrorWithStatus(error)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isErrorWithStatus(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isErrorWithStatus(undefined)).toBe(false);
    });

    it('should return false for strings', () => {
      expect(isErrorWithStatus('error')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(isErrorWithStatus(401)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from standard Error objects', () => {
      const error = new Error('Something went wrong');
      expect(getErrorMessage(error)).toBe('Something went wrong');
    });

    it('should extract message from custom error objects', () => {
      const error = { message: 'Custom error message' };
      expect(getErrorMessage(error)).toBe('Custom error message');
    });

    it('should return the string directly when error is a string', () => {
      expect(getErrorMessage('Error string')).toBe('Error string');
    });

    it('should return JSON string for objects without message', () => {
      const error = { code: 404, details: 'Not found' };
      expect(getErrorMessage(error)).toBe('{"code":404,"details":"Not found"}');
    });

    it('should return "Unknown error" for null', () => {
      expect(getErrorMessage(null)).toBe('null');
    });

    it('should return "Unknown error" for undefined', () => {
      expect(getErrorMessage(undefined)).toBe('Unknown error');
    });

    it('should return string representation for numbers', () => {
      expect(getErrorMessage(404)).toBe('404');
    });

    it('should return string representation for booleans', () => {
      expect(getErrorMessage(false)).toBe('false');
    });

    it('should handle empty objects', () => {
      expect(getErrorMessage({})).toBe('{}');
    });

    it('should handle circular references gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circular: any = { name: 'circular' };
      circular.self = circular;
      expect(getErrorMessage(circular)).toBe('Unknown error');
    });

    it('should handle errors with empty message', () => {
      const error = { message: '' };
      expect(getErrorMessage(error)).toBe('');
    });
  });

  describe('toErrorObject', () => {
    it('should convert standard Error to object with message and stack', () => {
      const error = new Error('Test error');
      const result = toErrorObject(error);

      expect(result.message).toBe('Test error');
      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe('string');
    });

    it('should convert custom error object with message only', () => {
      const error = { message: 'Custom error' };
      const result = toErrorObject(error);

      expect(result.message).toBe('Custom error');
      expect(result.stack).toBeUndefined();
    });

    it('should handle error objects without message', () => {
      const error = { code: 500 };
      const result = toErrorObject(error);

      expect(result.message).toBe('{"code":500}');
      expect(result.stack).toBeUndefined();
    });

    it('should convert string errors to object with message', () => {
      const result = toErrorObject('String error');

      expect(result.message).toBe('String error');
      expect(result.stack).toBeUndefined();
    });

    it('should handle null with "Unknown error" message', () => {
      const result = toErrorObject(null);

      expect(result.message).toBe('null');
      expect(result.stack).toBeUndefined();
    });

    it('should handle undefined with "Unknown error" message', () => {
      const result = toErrorObject(undefined);

      expect(result.message).toBe('Unknown error');
      expect(result.stack).toBeUndefined();
    });

    it('should preserve stack from Error objects', () => {
      const error = new Error('Error with stack');
      const result = toErrorObject(error);

      expect(result.stack).toContain('Error with stack');
    });

    it('should not include stack for custom objects with message but no stack', () => {
      const error = { message: 'Custom', stack: undefined };
      const result = toErrorObject(error);

      expect(result.message).toBe('Custom');
      expect(result.stack).toBeUndefined();
    });

    it('should handle circular references', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circular: any = { name: 'circular' };
      circular.self = circular;
      const result = toErrorObject(circular);

      expect(result.message).toBe('Unknown error');
      expect(result.stack).toBeUndefined();
    });

    it('should handle Error objects with custom properties', () => {
      const error = new Error('Custom Error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).customProp = 'custom value';
      const result = toErrorObject(error);

      expect(result.message).toBe('Custom Error');
      expect(result.stack).toBeDefined();
    });
  });
});
