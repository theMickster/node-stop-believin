import 'reflect-metadata';

/**
 * Route Decorators for Express Controllers
 *
 * This module provides TypeScript decorators for defining Express routes
 * directly on controller methods, eliminating the need for separate route files.
 */

// Metadata keys
export const ROUTE_METADATA_KEY = Symbol('route');
export const AUTH_METADATA_KEY = Symbol('auth');

/**
 * HTTP Methods - using const object instead of enum
 * @see https://contributing.bitwarden.com/architecture/adr/ts-deprecate-enums
 */
export const HttpMethod = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

/**
 * Route metadata stored on methods
 */
export interface RouteMetadata {
  method: HttpMethod;
  path: string;
  methodName: string;
}

/**
 * Auth metadata stored on methods
 */
export interface AuthMetadata {
  requiresAuth: boolean;
  roles?: string[];
}

/**
 * Get all routes defined on a controller class
 */
export function getRoutes(target: object): RouteMetadata[] {
  const routes: RouteMetadata[] = [];
  const prototype = Object.getPrototypeOf(target) as object;

  for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    const routeMetadata = Reflect.getMetadata(ROUTE_METADATA_KEY, prototype, propertyName) as
      | Omit<RouteMetadata, 'methodName'>
      | undefined;
    if (routeMetadata) {
      routes.push({
        ...routeMetadata,
        methodName: propertyName,
      });
    }
  }

  return routes;
}

/**
 * Get auth metadata for a specific method
 */
export function getAuthMetadata(target: object, propertyKey: string): AuthMetadata | undefined {
  const prototype = Object.getPrototypeOf(target) as object;
  return Reflect.getMetadata(AUTH_METADATA_KEY, prototype, propertyKey) as AuthMetadata | undefined;
}

/**
 * HTTP Method Decorators
 */

function createRouteDecorator(method: HttpMethod) {
  return function (path = '/'): MethodDecorator {
    return function (target: object, propertyKey: string | symbol) {
      Reflect.defineMetadata(
        ROUTE_METADATA_KEY,
        { method, path },
        target,
        propertyKey,
      );
    };
  };
}

/**
 * @Get decorator - Defines a GET route
 * @param path - Route path (default: '/')
 * @example
 * @Get('/books/:id')
 * @Authenticated()
 * @RequireRoles('Books.Reader')
 * async getBookById(req: Request, res: Response) { }
 */
export const Get = createRouteDecorator(HttpMethod.GET);

/**
 * @Post decorator - Defines a POST route
 * @param path - Route path (default: '/')
 */
export const Post = createRouteDecorator(HttpMethod.POST);

/**
 * @Put decorator - Defines a PUT route
 * @param path - Route path (default: '/')
 */
export const Put = createRouteDecorator(HttpMethod.PUT);

/**
 * @Patch decorator - Defines a PATCH route
 * @param path - Route path (default: '/')
 */
export const Patch = createRouteDecorator(HttpMethod.PATCH);

/**
 * @Delete decorator - Defines a DELETE route
 * @param path - Route path (default: '/')
 */
export const Delete = createRouteDecorator(HttpMethod.DELETE);

/**
 * @Authenticated decorator - Requires authentication for this route
 * @example
 * @Get('/profile')
 * @Authenticated()
 * async getProfile(req: Request, res: Response) { }
 */
export function Authenticated(): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    Reflect.defineMetadata(
      AUTH_METADATA_KEY,
      { requiresAuth: true },
      target,
      propertyKey,
    );
  };
}

/**
 * @RequireRoles decorator - Requires specific roles for this route
 * Automatically includes authentication
 * @param roles - Single role or array of roles (OR logic)
 * @example
 * @Post('/books')
 * @RequireRoles('Books.Writer', 'Books.Admin')
 * async createBook(req: Request, res: Response) { }
 */
export function RequireRoles(...roles: string[]): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    Reflect.defineMetadata(
      AUTH_METADATA_KEY,
      { requiresAuth: true, roles },
      target,
      propertyKey,
    );
  };
}
/**
 * Parameter Decorator: Inject ExecutionContext into controller method parameter
 *
 * Extracts the current request's ExecutionContext from AsyncLocalStorage
 * and injects it into the decorated parameter.
 *
 * The ExecutionContext contains:
 * - User identity (userId, displayName, userName, userEmail)
 * - Temporal context (timestamp for consistent createdAt/updatedAt)
 * - Tracking IDs (correlationId, requestId, sessionId, idempotencyKey)
 * - Client context (clientIp, userAgent, language, country, deviceType)
 * - Authorization (roles, scopes)
 *
 * @example
 * import { ExecutionContext } from '@middleware/requestContext';
 *
 * @Post('/')
 * async createAuthor(
 *   req: Request<object, object, CreateAuthorDto>,
 *   res: Response,
 *   @ExecutionContext() context: ExecutionContext
 * ): Promise<void> {
 *   const command = new CreateAuthorCommand(req.body, context);
 *   // Use context.userId, context.timestamp, etc.
 * }
 */
export function ExecutionContext(): ParameterDecorator {
  return function (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    if (!propertyKey) return;
    // Store metadata about which parameter should receive the context
    const existingParams = (Reflect.getOwnMetadata('executionContext:params', target, propertyKey) as number[] | undefined) || [];
    existingParams.push(parameterIndex);
    Reflect.defineMetadata('executionContext:params', existingParams, target, propertyKey);
  };
}
