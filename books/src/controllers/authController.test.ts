import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { ITokenPayload } from 'passport-azure-ad';

describe('AuthController', () => {
  let controller: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    controller = new AuthController();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockRequest = {
      authInfo: undefined,
      user: undefined,
    };
  });

  describe('getProtectedRoute', () => {
    it('should return user information from authInfo', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        name: 'Michael Scott',
        preferred_username: 'michael.scott@dunder.com',
        roles: ['Books.Admin'],
        scp: 'Books.Read Books.Write',
      };

      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      controller.getProtectedRoute(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'This is a protected route',
        user: {
          name: 'Michael Scott',
          username: 'michael.scott@dunder.com',
          roles: ['Books.Admin'],
          scopes: ['Books.Read', 'Books.Write'],
        },
      });
    });

    it('should handle missing authInfo gracefully', () => {
      mockRequest.authInfo = undefined;

      controller.getProtectedRoute(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'This is a protected route',
        user: {
          name: undefined,
          username: undefined,
          roles: [],
          scopes: [],
        },
      });
    });

    it('should handle missing scopes in authInfo', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        name: 'Jim Halpert',
        preferred_username: 'jim.halpert@dunder.com',
        roles: ['Books.Writer'],
      };

      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      controller.getProtectedRoute(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            scopes: [],
          }),
        }),
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from req.user', () => {
      const mockUser = {
        oid: '12345',
        name: 'Pam Beesly',
        preferred_username: 'pam.beesly@dunder.com',
      };

      mockRequest.user = mockUser;

      controller.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Current user information',
        user: mockUser,
      });
    });

    it('should handle undefined user', () => {
      mockRequest.user = undefined;

      controller.getCurrentUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Current user information',
        user: undefined,
      });
    });
  });

  describe('getAdminStats', () => {
    it('should return admin statistics with user info', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        name: 'Michael Scott',
        roles: ['Books.Admin'],
      };

      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      controller.getAdminStats(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Admin Statistics',
        stats: {
          totalBooks: 42,
          totalUsers: 10,
          totalAuthors: 15,
          systemHealth: 'Healthy',
        },
        accessInfo: {
          admin: 'Michael Scott',
          roles: ['Books.Admin'],
        },
      });
    });

    it('should return stats with undefined user info when authInfo is missing', () => {
      mockRequest.authInfo = undefined;

      controller.getAdminStats(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          accessInfo: {
            admin: undefined,
            roles: undefined,
          },
        }),
      );
    });
  });

  describe('getRoleCheck', () => {
    it('should return comprehensive role and scope analysis for Admin', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        name: 'Michael Scott',
        preferred_username: 'michael.scott@dunder.com',
        roles: ['Books.Admin'],
        scp: 'Books.Read Books.Write Delete.Books',
      };

      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      controller.getRoleCheck(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Role and Scope Check',
        user: {
          name: 'Michael Scott',
          username: 'michael.scott@dunder.com',
        },
        authorization: {
          roles: ['Books.Admin'],
          scopes: ['Books.Read', 'Books.Write', 'Delete.Books'],
          isAdmin: true,
          isWriter: true,
          isReader: true,
        },
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: true,
        },
      });
    });

    it('should return correct analysis for Writer role', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        name: 'Jim Halpert',
        preferred_username: 'jim.halpert@dunder.com',
        roles: ['Books.Writer', 'Books.Reader'],
        scp: 'Books.Read Books.Write',
      };

      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      controller.getRoleCheck(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          authorization: {
            roles: ['Books.Writer', 'Books.Reader'],
            scopes: ['Books.Read', 'Books.Write'],
            isAdmin: false,
            isWriter: true,
            isReader: true,
          },
          permissions: {
            canRead: true,
            canWrite: true,
            canDelete: false,
          },
        }),
      );
    });

    it('should return correct analysis for Reader role', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        name: 'Pam Beesly',
        preferred_username: 'pam.beesly@dunder.com',
        roles: ['Books.Reader'],
        scp: 'Books.Read',
      };

      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      controller.getRoleCheck(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          authorization: {
            roles: ['Books.Reader'],
            scopes: ['Books.Read'],
            isAdmin: false,
            isWriter: false,
            isReader: true,
          },
          permissions: {
            canRead: true,
            canWrite: false,
            canDelete: false,
          },
        }),
      );
    });

    it('should handle missing authInfo with empty roles and scopes', () => {
      mockRequest.authInfo = undefined;

      controller.getRoleCheck(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          authorization: {
            roles: [],
            scopes: [],
            isAdmin: false,
            isWriter: false,
            isReader: false,
          },
          permissions: {
            canRead: false,
            canWrite: false,
            canDelete: false,
          },
        }),
      );
    });

    it('should handle user with no roles or scopes', () => {
      const mockAuthInfo: Partial<ITokenPayload> = {
        name: 'Toby Flenderson',
        preferred_username: 'toby.flenderson@dunder.com',
      };

      mockRequest.authInfo = mockAuthInfo as ITokenPayload;

      controller.getRoleCheck(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          authorization: {
            roles: [],
            scopes: [],
            isAdmin: false,
            isWriter: false,
            isReader: false,
          },
          permissions: {
            canRead: false,
            canWrite: false,
            canDelete: false,
          },
        }),
      );
    });
  });
});
