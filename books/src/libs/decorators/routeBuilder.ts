import { Router, RequestHandler } from 'express';
import { authenticateToken } from '@middleware/authMiddleware';
import { requireRole } from '@middleware/authorizationMiddleware';
import { getRoutes, getAuthMetadata } from './route.decorators';

// Re-export utilities for use by route files
export { getRoutes, getAuthMetadata } from './route.decorators';

/**
 * Route Builder - Registers decorated controller routes
 *
 * This utility reads decorator metadata from controller classes and
 * automatically registers routes with Express Router.
 */

/**
 * Build routes from a decorated controller instance
 * @param controller - Controller instance with decorated methods
 * @returns Express Router with registered routes
 * @example
 * const controller = new BookController(...);
 * const router = buildRoutes(controller);
 * app.use('/v1/books', router);
 */
export function buildRoutes(controller: object): Router {
  const router = Router();
  const routes = getRoutes(controller);

  for (const route of routes) {
    const { method, path, methodName } = route;
    const handler = (controller as unknown as Record<string, unknown>)[methodName];

    if (typeof handler !== 'function') {
      throw new TypeError(`Method ${methodName} is not a function on controller`);
    }

    // Get auth metadata
    const authMetadata = getAuthMetadata(controller, methodName);

    // Build middleware array
    const middlewares: RequestHandler[] = [];

    if (authMetadata?.requiresAuth) {
      middlewares.push(authenticateToken);

      if (authMetadata.roles && authMetadata.roles.length > 0) {
        middlewares.push(requireRole(authMetadata.roles));
      }
    }

    // Bind handler to controller instance and cast to RequestHandler
    const boundHandler = handler.bind(controller) as RequestHandler;

    // Register route using switch statement to avoid unsafe dynamic access
    switch (method) {
      case 'get':
        router.get(path, ...middlewares, boundHandler);
        break;
      case 'post':
        router.post(path, ...middlewares, boundHandler);
        break;
      case 'put':
        router.put(path, ...middlewares, boundHandler);
        break;
      case 'patch':
        router.patch(path, ...middlewares, boundHandler);
        break;
      case 'delete':
        router.delete(path, ...middlewares, boundHandler);
        break;
      default:
        throw new TypeError(`Unsupported HTTP method: ${method}`);
    }
  }

  return router;
}
