import { commandOk, commandFail, isCommandOk, isCommandFail, CommandResult, ErrorDetail } from './commandResult';
import { ErrorCodes, HttpStatus } from './errorCodes';

describe('commandResult', () => {
  describe('commandOk', () => {
    it('should return success true with data when data is provided', () => {
      const data = { id: '123', name: 'Test' };
      const result = commandOk(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return success true with undefined data', () => {
      const result = commandOk(undefined as void);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });
  });

  describe('commandFail', () => {
    it('should return failure with error details and default status code', () => {
      const result = commandFail(ErrorCodes.VALIDATION_FAILED, 'Something went wrong');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.message).toBe('Something went wrong');
        expect(result.error.statusCode).toBe(500); // default
        expect(result.error.field).toBeUndefined();
      }
    });

    it('should return failure with error details and custom status code', () => {
      const result = commandFail(ErrorCodes.BOOK_NOT_FOUND, 'Book not found', HttpStatus.NOT_FOUND);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.BOOK_NOT_FOUND);
        expect(result.error.message).toBe('Book not found');
        expect(result.error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should include field when provided', () => {
      const result = commandFail(
        ErrorCodes.INVALID_ISBN,
        'ISBN format is invalid',
        HttpStatus.BAD_REQUEST,
        'isbn'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.INVALID_ISBN);
        expect(result.error.message).toBe('ISBN format is invalid');
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(result.error.field).toBe('isbn');
      }
    });
  });

  describe('isCommandOk', () => {
    it('should return true for successful command result with data', () => {
      const result: CommandResult<string> = { success: true, data: 'test' };

      expect(isCommandOk(result)).toBe(true);

      // Type guard should narrow the type
      if (isCommandOk(result)) {
        expect(result.success).toBe(true);
        expect(result.data).toBe('test');
      }
    });

    it('should return false for failed command result', () => {
      const errorDetail: ErrorDetail = {
        code: ErrorCodes.DATABASE_ERROR,
        message: 'Failed',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
      const result: CommandResult<string> = { success: false, error: errorDetail };

      expect(isCommandOk(result)).toBe(false);
    });
  });

  describe('isCommandFail', () => {
    it('should return true for failed command result', () => {
      const errorDetail: ErrorDetail = {
        code: ErrorCodes.BOOK_NOT_FOUND,
        message: 'Error occurred',
        statusCode: HttpStatus.NOT_FOUND,
      };
      const result: CommandResult<string> = { success: false, error: errorDetail };

      expect(isCommandFail(result)).toBe(true);

      // Type guard should narrow the type
      if (isCommandFail(result)) {
        expect(result.success).toBe(false);
        expect(result.error.message).toBe('Error occurred');
        expect(result.error.code).toBe(ErrorCodes.BOOK_NOT_FOUND);
      }
    });

    it('should return true for failed command result with field', () => {
      const errorDetail: ErrorDetail = {
        code: ErrorCodes.VALIDATION_FAILED,
        message: 'Validation error',
        statusCode: HttpStatus.BAD_REQUEST,
        field: 'title',
      };
      const result: CommandResult<string> = { success: false, error: errorDetail };

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.field).toBe('title');
      }
    });

    it('should return false for successful command result', () => {
      const result: CommandResult<string> = { success: true, data: 'Success' };

      expect(isCommandFail(result)).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle commandOk and isCommandOk together', () => {
      const data = { value: 42 };
      const result = commandOk(data);

      expect(isCommandOk(result)).toBe(true);
      expect(isCommandFail(result)).toBe(false);
    });

    it('should handle commandFail and isCommandFail together', () => {
      const result = commandFail(ErrorCodes.DATABASE_ERROR, 'Error', HttpStatus.INTERNAL_SERVER_ERROR);

      expect(isCommandFail(result)).toBe(true);
      expect(isCommandOk(result)).toBe(false);
    });

    it('should properly type guard complex data types', () => {
      interface ComplexData {
        id: string;
        nested: { value: number };
      }

      const data: ComplexData = { id: 'abc', nested: { value: 100 } };
      const result = commandOk(data);

      if (isCommandOk(result)) {
        // TypeScript should understand result.data is ComplexData
        expect(result.data.id).toBe('abc');
        expect(result.data.nested.value).toBe(100);
      }
    });
  });
});
