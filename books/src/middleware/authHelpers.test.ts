import { authRoute, authOnly } from './authHelpers';
import { authenticateToken } from './authMiddleware';
import { requireRole } from './authorizationMiddleware';

jest.mock('./authMiddleware', () => ({
  authenticateToken: jest.fn(),
}));

jest.mock('./authorizationMiddleware', () => ({
  requireRole: jest.fn(() => jest.fn()),
}));

describe('authHelpers', () => {
  describe('authRoute', () => {
    it('should return an array with authenticateToken and requireRole middleware', () => {
      const roles = ['Books.Reader', 'Books.Admin'];
      const result = authRoute(roles);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(authenticateToken);
      expect(typeof result[1]).toBe('function');
      expect(requireRole).toHaveBeenCalledWith(roles);
    });

    it('should work with a single role as string', () => {
      const role = 'Books.Admin';
      const result = authRoute(role);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toBe(authenticateToken);
      expect(typeof result[1]).toBe('function');
    });

    it('should work with multiple roles as array', () => {
      const roles = ['Books.Reader', 'Books.Writer', 'Books.Admin'];
      const result = authRoute(roles);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should return middleware that are RequestHandlers', () => {
      const result = authRoute('Books.Admin');

      // Verify the middleware can be used as RequestHandlers
      for (const middleware of result) {
        expect(typeof middleware).toBe('function');
      }
    });
  });

  describe('authOnly', () => {
    it('should return an array with only authenticateToken middleware', () => {
      const result = authOnly();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(authenticateToken);
    });

    it('should return middleware that is a RequestHandler', () => {
      const result = authOnly();

      // Verify the middleware can be used as RequestHandler
      expect(typeof result[0]).toBe('function');
    });
  });

  describe('integration with Express routes', () => {
    it('authRoute should be spreadable into Express router methods', () => {
      const middlewares = authRoute(['Books.Reader']);

      // Should be able to spread into an array
      const routeHandlers = [...middlewares, jest.fn()];

      expect(routeHandlers).toHaveLength(3);
      expect(routeHandlers[0]).toBe(authenticateToken);
      expect(typeof routeHandlers[1]).toBe('function');
      expect(typeof routeHandlers[2]).toBe('function');
    });

    it('authOnly should be spreadable into Express router methods', () => {
      const middlewares = authOnly();

      // Should be able to spread into an array
      const routeHandlers = [...middlewares, jest.fn()];

      expect(routeHandlers).toHaveLength(2);
      expect(routeHandlers[0]).toBe(authenticateToken);
      expect(typeof routeHandlers[1]).toBe('function');
    });
  });
});
