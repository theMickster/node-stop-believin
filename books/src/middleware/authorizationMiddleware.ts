import { Request, Response, NextFunction } from 'express';
import { ITokenPayload } from 'passport-azure-ad';
import authConfig from '../config/authConfig';

/**
 * Authorization Middleware for Azure Entra ID
 *
 * Provides role-based and scope-based authorization for protected routes.
 * These middlewares should be used AFTER authenticateToken middleware.
 *
 * Token Claims:
 * - scp (scope): Space-delimited string of delegated permissions (e.g., "Books.Read Books.Write")
 * - roles: Array of app roles assigned to the user (e.g., ["Books.Admin", "Books.Writer"])
 */

/**
 * Helper function to get scopes from token
 * Scopes can be in 'scp' (v2 tokens) or 'scope' claim
 */
function getScopes(authInfo: ITokenPayload): string[] {
  if (authInfo.scp) {
    return authInfo.scp.split(' ');
  }
  // Note: 'scope' claim is not standard in ITokenPayload, but checking scp is sufficient
  return [];
}

/**
 * Helper function to get roles from token
 */
function getRoles(authInfo: ITokenPayload): string[] {
  return authInfo.roles || [];
}

/**
 * Middleware to require specific scope(s)
 *
 * Validates that the token contains at least one of the required scopes.
 *
 * @param requiredScopes - Single scope or array of scopes (OR logic - user needs at least one)
 *
 * @example
 * // Require Books.Read scope
 * router.get('/books', authenticateToken, requireScope('Books.Read'), getAllBooks);
 *
 * @example
 * // Require either Books.Read OR Books.Write
 * router.get('/books/:id', authenticateToken, requireScope(['Books.Read', 'Books.Write']), getBook);
 */
export function requireScope(requiredScopes: string | string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authInfo = req.authInfo as ITokenPayload;

    if (!authInfo) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication information found',
      });
      return;
    }

    const tokenScopes = getScopes(authInfo);
    const scopesToCheck = Array.isArray(requiredScopes) ? requiredScopes : [requiredScopes];

    // Check if token has at least one of the required scopes
    const hasRequiredScope = scopesToCheck.some((scope) => tokenScopes.includes(scope));

    if (!hasRequiredScope) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient scope permissions. Required: ${scopesToCheck.join(' OR ')}`,
        required: scopesToCheck,
        provided: tokenScopes,
      });
      return;
    }

    next();
  };
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
 * Middleware to require BOTH scope AND role
 *
 * Validates that the token has the required scope AND the user has the required role.
 * This provides defense-in-depth: the app must have permission AND the user must have permission.
 *
 * @param requiredScope - Required scope(s)
 * @param requiredRole - Required role(s)
 *
 * @example
 * // Require both Books.Write scope AND Books.Writer role
 * router.post('/books',
 *   authenticateToken,
 *   requireScopeAndRole('Books.Write', 'Books.Writer'),
 *   createBook
 * );
 */
export function requireScopeAndRole(
  requiredScope: string | string[],
  requiredRole: string | string[]
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Use both middleware in sequence
    requireScope(requiredScope)(req, res, (err?: unknown) => {
      if (err) {
        next(err);
        return;
      }

      requireRole(requiredRole)(req, res, next);
    });
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

/**
 * Helper function to check if a token has a specific scope
 * Can be used in route handlers for conditional logic
 *
 * @example
 * if (hasScope(req.authInfo, 'Books.Write')) {
 *   // Allow editing
 * }
 */
export function hasScope(authInfo: ITokenPayload | undefined, scope: string): boolean {
  if (!authInfo) return false;
  const scopes = getScopes(authInfo);
  return scopes.includes(scope);
}
