import { Router, RequestHandler } from 'express';

import { authenticateToken } from '@middleware/authMiddleware';
import { requireRole } from '@middleware/authorizationMiddleware';
import { getRequestContext } from '@middleware/requestContext';

import { getRoutes, getAuthMetadata } from './route.decorators';
import 'reflect-metadata';

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

    // Check if this method has @ExecutionContext() parameter decorators
    const contextParamIndexes = Reflect.getOwnMetadata('executionContext:params', controller, methodName) as number[] | undefined;

    // Bind handler to controller instance
    const boundHandler = handler.bind(controller) as (...args: unknown[]) => unknown;

    // Create a wrapper that injects ExecutionContext if needed
    const wrappedHandler: RequestHandler = (req, res, next) => {
      const args: unknown[] = [req, res, next];

      // Inject ExecutionContext at the specified parameter positions
      if (contextParamIndexes && contextParamIndexes.length > 0) {
        const context = getRequestContext(req);
        for (const paramIndex of contextParamIndexes) {
          args[paramIndex] = context;
        }
      }

      // Call the original handler with injected parameters
      return boundHandler(...args) as unknown;
    };

    // Register route using switch statement to avoid unsafe dynamic access
    switch (method) {
      case 'get':
        router.get(path, ...middlewares, wrappedHandler);
        break;
      case 'post':
        router.post(path, ...middlewares, wrappedHandler);
        break;
      case 'put':
        router.put(path, ...middlewares, wrappedHandler);
        break;
      case 'patch':
        router.patch(path, ...middlewares, wrappedHandler);
        break;
      case 'delete':
        router.delete(path, ...middlewares, wrappedHandler);
        break;
      default:
        throw new TypeError(`Unsupported HTTP method: ${method}`);
    }
  }

  return router;
}
