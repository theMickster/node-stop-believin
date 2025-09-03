import { Request, Response, NextFunction } from 'express';
import { ITokenPayload } from 'passport-azure-ad';

import authConfig from '../config/authConfig';

/**
 * Authorization Middleware for Azure Entra ID
 *
 * Provides role-based authorization for protected routes.
 * These middlewares should be used AFTER authenticateToken middleware.
 *
 * Token Claims:
 * - roles: Array of app roles assigned to the user (e.g., ["Books.Admin", "Books.Writer", "Books.Reader"])
 *
 * Role Assignment:
 * Roles are assigned in Azure Portal:
 * 1. Go to Enterprise Applications → Your App
 * 2. Navigate to Users and groups
 * 3. Assign users/groups to roles (Books.Admin, Books.Writer, Books.Reader)
 */

/**
 * Helper function to get roles from token
 */
function getRoles(authInfo: ITokenPayload): string[] {
  return authInfo.roles || [];
}

/**
 * Middleware to require specific role(s)
 *
 * Validates that the user has at least one of the required app roles.
 * Admins automatically pass all role checks.
 *
 * @param requiredRoles - Single role or array of roles (OR logic - user needs at least one)
 *
 * @example
 * // Require Books.Writer role
 * router.post('/books', authenticateToken, requireRole('Books.Writer'), createBook);
 *
 * @example
 * // Require either Books.Writer OR Books.Admin
 * router.delete('/books/:id', authenticateToken, requireRole(['Books.Writer', 'Books.Admin']), deleteBook);
 */
export function requireRole(requiredRoles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authInfo = req.authInfo as ITokenPayload;

    if (!authInfo) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication information found',
      });
      return;
    }

    const userRoles = getRoles(authInfo);
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Admin role bypasses all checks
    if (userRoles.includes(authConfig.roles.admin)) {
      next();
      return;
    }

    // Check if user has at least one of the required roles
    const hasRequiredRole = rolesToCheck.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient role permissions. Required: ${rolesToCheck.join(' OR ')}`,
        required: rolesToCheck,
        provided: userRoles,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user is an Admin
 *
 * Convenience middleware to check for Books.Admin role.
 *
 * @example
 * router.delete('/books/:id', authenticateToken, requireAdmin, deleteBook);
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireRole(authConfig.roles.admin)(req, res, next);
}

/**
 * Middleware to get current user info from token
 *
 * Extracts user information from the token and adds a user object to the request.
 * This is useful for logging or business logic that needs user context.
 *
 * @example
 * router.get('/me', authenticateToken, getCurrentUser, (req, res) => {
 *   res.json(req.user);
 * });
 */
export function getCurrentUser(req: Request, res: Response, next: NextFunction): void {
  const authInfo = req.authInfo as ITokenPayload;

  if (!authInfo) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'No authentication information found',
    });
    return;
  }

  // Attach user info to request
  // Since Express.User extends ITokenPayload, we assign the full authInfo
  req.user = authInfo as Express.User;

  next();
}

/**
 * Helper function to check if a user has a specific role
 * Can be used in route handlers for conditional logic
 *
 * @example
 * if (hasRole(req.authInfo, 'Books.Admin')) {
 *   // Show admin features
 * }
 */
export function hasRole(authInfo: ITokenPayload | undefined, role: string): boolean {
  if (!authInfo) return false;
  const roles = getRoles(authInfo);
  return roles.includes(role) || roles.includes(authConfig.roles.admin);
}
