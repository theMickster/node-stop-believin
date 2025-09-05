import { Request, Response } from 'express';

import { HttpStatus } from '@libs/cqrs/httpStatusCodes';

import authConfig from '../../../config/authConfig';

export class AuthController {
  public getProtectedRoute(req: Request, res: Response): void {
    res.status(HttpStatus.OK).json({
      message: 'This is a protected route',
      user: {
        name: req.authInfo?.name,
        username: req.authInfo?.preferred_username,
        roles: req.authInfo?.roles || [],
      },
    });
  }

  public getCurrentUser(req: Request, res: Response): void {
    res.status(HttpStatus.OK).json({
      message: 'Current user information',
      user: req.user,
    });
  }

  public getAdminStats(req: Request, res: Response): void {
    res.status(HttpStatus.OK).json({
      message: 'Admin Statistics',
      stats: {
        totalBooks: 42,
        totalUsers: 10,
        totalAuthors: 15,
        systemHealth: 'Healthy',
      },
      accessInfo: {
        admin: req.authInfo?.name,
        roles: req.authInfo?.roles,
      },
    });
  }

  public getRoleCheck(req: Request, res: Response): void {
    const roles = req.authInfo?.roles || [];

    res.status(HttpStatus.OK).json({
      message: 'Role Check',
      user: {
        name: req.authInfo?.name,
        username: req.authInfo?.preferred_username,
      },
      authorization: {
        roles: roles,
        isAdmin: roles.includes(authConfig.roles.admin),
        isWriter: roles.includes(authConfig.roles.writer) || roles.includes(authConfig.roles.admin),
        isReader:
          roles.includes(authConfig.roles.reader) ||
          roles.includes(authConfig.roles.writer) ||
          roles.includes(authConfig.roles.admin),
      },
    });
  }
}
