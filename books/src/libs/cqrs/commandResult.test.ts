import { commandOk, commandFail, isCommandOk, isCommandFail, CommandResult } from './commandResult';

describe('commandResult', () => {
  describe('commandOk', () => {
    it('should return success true with data when data is provided', () => {
      const data = { id: '123', name: 'Test' };
      const result = commandOk(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.error).toBeUndefined();
    });

    it('should return success true without data when no data is provided', () => {
      const result = commandOk();

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should return success true when undefined is explicitly passed', () => {
      const result = commandOk(undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('commandFail', () => {
    it('should return failure with error message', () => {
      const errorMessage = 'Something went wrong';
      const result = commandFail(errorMessage);

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.data).toBeUndefined();
      expect(result.code).toBeUndefined();
    });

    it('should return failure with error message and code', () => {
      const errorMessage = 'Validation failed';
      const errorCode = 'VALIDATION_ERROR';
      const result = commandFail(errorMessage, errorCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.code).toBe(errorCode);
      expect(result.data).toBeUndefined();
    });

    it('should not include code property when code is undefined', () => {
      const result = commandFail('Error message', undefined);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error message');
      expect(result).not.toHaveProperty('code');
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

    it('should return true for successful command result without data', () => {
      const result: CommandResult<string> = { success: true };

      expect(isCommandOk(result)).toBe(true);
    });

    it('should return false for failed command result', () => {
      const result: CommandResult<string> = { success: false, error: 'Failed' };

      expect(isCommandOk(result)).toBe(false);
    });
  });

  describe('isCommandFail', () => {
    it('should return true for failed command result', () => {
      const result: CommandResult<string> = { success: false, error: 'Error occurred' };

      expect(isCommandFail(result)).toBe(true);

      // Type guard should narrow the type
      if (isCommandFail(result)) {
        expect(result.success).toBe(false);
        expect(result.error).toBe('Error occurred');
      }
    });

    it('should return true for failed command result with code', () => {
      const result: CommandResult<string> = {
        success: false,
        error: 'Validation error',
        code: 'VAL_001'
      };

      expect(isCommandFail(result)).toBe(true);
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
      const result = commandFail('Error', 'ERR_CODE');

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
        expect(result.data?.id).toBe('abc');
        expect(result.data?.nested.value).toBe(100);
      }
    });
  });
});
