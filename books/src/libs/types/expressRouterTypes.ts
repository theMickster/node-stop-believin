/**
 * Type definitions for Express Router internals
 *
 * Express doesn't export proper types for its internal router structures,
 * so we define them here for type-safe testing of routes.
 */

/**
 * Represents a layer in the Express route stack
 * Each layer can have a method (get, post, put, delete, etc.)
 */
export interface RouteLayer {
  method?: string;
  name?: string;
  // Express internal handler function - using Function type as Express doesn't provide specific types
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  handle?: Function;
}

/**
 * Represents a route in the Express router
 * Contains the path and stack of middleware/handlers for that route
 */
export interface ExpressRoute {
  path: string;
  stack?: RouteLayer[];
  methods?: Record<string, boolean>;
}

/**
 * Represents a layer in the Express router stack
 * Can contain either a route or middleware
 */
export interface RouterLayer {
  name?: string;
  regexp?: RegExp;
  route?: ExpressRoute;
  // Express internal handler function - using Function type as Express doesn't provide specific types
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  handle?: Function;
}

/**
 * Type guard to check if a router layer contains a route
 *
 * @param layer - The router layer to check
 * @returns true if the layer has a route property
 */
export function isRouteLayer(layer: RouterLayer): layer is RouterLayer & { route: ExpressRoute } {
  return layer.route !== undefined;
}

/**
 * Type guard to check if a route layer has a specific HTTP method
 *
 * @param layer - The route layer to check
 * @param method - The HTTP method to check for (e.g., 'get', 'post')
 * @returns true if the layer handles the specified method
 */
export function hasMethod(layer: RouteLayer, method: string): boolean {
  return layer.method === method;
}
