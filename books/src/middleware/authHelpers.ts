import { RequestHandler } from 'express';

import { authenticateToken } from './authMiddleware';
import { requireRole } from './authorizationMiddleware';

/**
 * Auth Helper Functions
 *
 * These helpers simplify route protection by combining authentication and authorization
 * into single, reusable middleware arrays.
 */

/**
 * Combines authentication + authorization into a single middleware array
 *
 * This helper reduces boilerplate when protecting routes with both
 * authentication and role-based authorization.
 *
 * @param roles - Single role or array of roles (OR logic - user needs at least one)
 * @returns Array of middleware [authenticateToken, requireRole(roles)]
 *
 */
export function authRoute(roles: string | string[]): RequestHandler[] {
  // Type assertion needed because passport.authenticate returns 'any'
  // The middleware is properly typed as RequestHandler at runtime
  return [authenticateToken as RequestHandler, requireRole(roles)];
}

/**
 * Authentication only (no role check)
 *
 * Use this when you need authentication but don't care about specific roles.
 * Returns the middleware as an array for consistency with authRoute.
 *
 * @returns Array containing only authenticateToken middleware
 *
 */
export function authOnly(): RequestHandler[] {
  // Type assertion needed because passport.authenticate returns 'any'
  return [authenticateToken as RequestHandler];
}
