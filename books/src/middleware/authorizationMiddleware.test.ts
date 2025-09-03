import { Request, Response, NextFunction } from 'express';
import { ITokenPayload } from 'passport-azure-ad';

import {
  requireRole,
  requireAdmin,
  getCurrentUser,
  hasRole,
} from './authorizationMiddleware';

describe('Authorization Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockNext = jest.fn();

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockRequest = {
      authInfo: undefined,
      user: undefined,
    };
  });

  describe('requireRole', () => {
    it('should call next when user has required role', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: ['Books.Writer', 'Books.Reader'],
      };
      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      const middleware = requireRole('Books.Writer');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: ['Books.Reader'],
      };
      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      const middleware = requireRole('Books.Writer');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
          message: expect.stringContaining('Insufficient role permissions'),
        })
      );
    });

    it('should allow Admin role to bypass all checks', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: ['Books.Admin'],
      };
      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      const middleware = requireRole('Books.Writer');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle array of roles (OR logic)', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: ['Books.Reader'],
      };
      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      const middleware = requireRole(['Books.Writer', 'Books.Reader']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when authInfo is missing', () => {
      mockRequest.authInfo = undefined;

      const middleware = requireRole('Books.Writer');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should return 403 when roles array is empty', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: [],
      };
      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      const middleware = requireRole('Books.Writer');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
    });
  });

  describe('requireAdmin', () => {
    it('should call next when user has Admin role', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: ['Books.Admin'],
      };
      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 when user does not have Admin role', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: ['Books.Writer'],
      };
      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
    });
  });

  describe('getCurrentUser', () => {
    it('should attach user info to request and call next', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        oid: '12345',
        name: 'Michael Scott',
        preferred_username: 'michael.scott@dunder.com',
        roles: ['Books.Admin'],
      };
      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      getCurrentUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when authInfo is missing', () => {
      mockRequest.authInfo = undefined;

      getCurrentUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe('hasRole helper', () => {
    it('should return true when user has the role', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: ['Books.Writer'],
      };

      const result = hasRole(mockAuthInfo as ITokenPayload, 'Books.Writer');

      expect(result).toBe(true);
    });

    it('should return true when user is Admin regardless of role checked', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: ['Books.Admin'],
      };

      const result = hasRole(mockAuthInfo as ITokenPayload, 'Books.Writer');

      expect(result).toBe(true);
    });

    it('should return false when user does not have the role', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: ['Books.Reader'],
      };

      const result = hasRole(mockAuthInfo as ITokenPayload, 'Books.Writer');

      expect(result).toBe(false);
    });

    it('should return false when authInfo is undefined', () => {
      const result = hasRole(undefined, 'Books.Writer');

      expect(result).toBe(false);
    });

    it('should return false when roles array is empty', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        roles: [],
      };

      const result = hasRole(mockAuthInfo as ITokenPayload, 'Books.Writer');

      expect(result).toBe(false);
    });
  });
});
