import { setGlobalLogger, getGlobalLogger, getLoggerFromContext } from './loggerAccessor';
import { ILogger } from './logger.interface';

describe('loggerAccessor', () => {
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setGlobalLogger', () => {
    it('should set the global logger instance', () => {
      setGlobalLogger(mockLogger);
      const logger = getGlobalLogger();
      expect(logger).toBe(mockLogger);
    });

    it('should allow replacing the global logger', () => {
      const firstLogger = { ...mockLogger };
      const secondLogger: jest.Mocked<ILogger> = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        child: jest.fn(),
      };

      setGlobalLogger(firstLogger);
      expect(getGlobalLogger()).toBe(firstLogger);

      setGlobalLogger(secondLogger);
      expect(getGlobalLogger()).toBe(secondLogger);
    });
  });

  describe('getGlobalLogger', () => {
    it('should return the global logger when set', () => {
      setGlobalLogger(mockLogger);
      const logger = getGlobalLogger();
      expect(logger).toBe(mockLogger);
    });

    it('should return the same instance on multiple calls', () => {
      setGlobalLogger(mockLogger);
      const logger1 = getGlobalLogger();
      const logger2 = getGlobalLogger();
      expect(logger1).toBe(logger2);
      expect(logger1).toBe(mockLogger);
    });
  });

  describe('getLoggerFromContext', () => {
    beforeEach(() => {
      setGlobalLogger(mockLogger);
    });

    it('should return instance logger when available on context', () => {
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
      expect(result).not.toBe(mockLogger);
    });

    it('should return global logger when context has no logger property', () => {
      const context = { someOtherProperty: 'value' };
      const result = getLoggerFromContext(context);

      expect(result).toBe(mockLogger);
    });

    it('should return global logger when context is null', () => {
      const result = getLoggerFromContext(null);
      expect(result).toBe(mockLogger);
    });

    it('should return global logger when context is undefined', () => {
      const result = getLoggerFromContext(undefined);
      expect(result).toBe(mockLogger);
    });

    it('should return global logger when context is a primitive', () => {
      const result = getLoggerFromContext('string');
      expect(result).toBe(mockLogger);
    });

    it('should return global logger when logger property is not an object', () => {
      const context = { logger: 'not-a-logger' };
      const result = getLoggerFromContext(context);
      expect(result).toBe(mockLogger);
    });

    it('should return global logger when logger property is null', () => {
      const context = { logger: null };
      const result = getLoggerFromContext(context);
      expect(result).toBe(mockLogger);
    });

    it('should work with controller-like objects', () => {
      class MockController {
        constructor(public logger: ILogger) {}
      }

      const instanceLogger: ILogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        child: jest.fn(),
      };

      const controller = new MockController(instanceLogger);
      const result = getLoggerFromContext(controller);

      expect(result).toBe(instanceLogger);
    });

    it('should prefer instance logger over global logger', () => {
      const instanceLogger: ILogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        child: jest.fn(),
      };

      const context = {
        logger: instanceLogger,
        otherProperty: 'value',
      };

      const result = getLoggerFromContext(context);
      expect(result).toBe(instanceLogger);
      expect(result).not.toBe(mockLogger);

      // Verify it's using the instance logger by calling a method
      result.info('test');
      expect(instanceLogger.info).toHaveBeenCalledWith('test');
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle deeply nested context objects', () => {
      const instanceLogger: ILogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        child: jest.fn(),
      };

      const context = {
        nested: {
          deeply: {
            property: 'value',
          },
        },
        logger: instanceLogger,
      };

      const result = getLoggerFromContext(context);
      expect(result).toBe(instanceLogger);
    });
  });

  describe('hybrid logger resolution', () => {
    it('should demonstrate hybrid approach: instance first, then global', () => {
      const globalLogger = mockLogger;
      const instanceLogger: ILogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        child: jest.fn(),
      };

      setGlobalLogger(globalLogger);

      // Controller with instance logger
      const contextWithLogger = { logger: instanceLogger };
      expect(getLoggerFromContext(contextWithLogger)).toBe(instanceLogger);

      // Controller without instance logger
      const contextWithoutLogger = {};
      expect(getLoggerFromContext(contextWithoutLogger)).toBe(globalLogger);
    });
  });
});
