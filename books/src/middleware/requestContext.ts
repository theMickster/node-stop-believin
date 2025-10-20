import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request Context Interface
 *
 * Contains all contextual information about the current request including:
 * - Correlation and request tracking IDs
 * - HTTP request metadata
 * - Authenticated user information (from Azure Entra ID JWT)
 * - Authorization context (roles and scopes)
 */
export interface RequestContext {
  /** Correlation ID for tracking requests across distributed systems. Can be provided by client via X-Correlation-Id header */
  correlationId: string;

  /** Unique ID for this specific request */
  requestId: string;

  /** Request start timestamp */
  timestamp: Date;

  /** HTTP method (GET, POST, etc.) */
  method: string;

  /** Request path */
  path: string;

  /** User ID from JWT token (oid or sub claim) */
  userId?: string;

  /** User name from JWT token (preferred_username or name claim) */
  userName?: string;

  /** User email from JWT token (email or upn claim) */
  userEmail?: string;

  /** Azure AD Tenant ID from JWT token (tid claim) */
  tenantId?: string;

  /** User roles from JWT token (roles claim array) */
  roles?: string[];

  /** OAuth scopes from JWT token (scp claim, space-delimited string converted to array) */
  scopes?: string[];

  /** Client IP address */
  clientIp?: string;

  /** User agent string from request headers */
  userAgent?: string;
}

/**
 * AsyncLocalStorage instance for maintaining request context across async operations
 * This allows access to request context without explicitly passing it through function parameters
 */
export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Request Context Middleware
 *
 * Creates and maintains request context using AsyncLocalStorage.
 * This middleware should be registered early in the middleware chain,
 * ideally after authentication so user context is available.
 *
 * The context is automatically propagated to all async operations within the request.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Create base context
  const context: RequestContext = {
    correlationId: (req.headers['x-correlation-id'] as string) || uuidv4(),
    requestId: uuidv4(),
    timestamp: new Date(),
    method: req.method,
    path: req.path,
  };

  // Add optional context properties only if they exist
  const clientIp = req.ip || req.socket.remoteAddress;
  if (clientIp) context.clientIp = clientIp;

  const userAgent = req.headers['user-agent'];
  if (userAgent) context.userAgent = userAgent;

  // Extract user context from JWT token if authenticated
  // req.user is populated by passport-azure-ad after successful authentication
  if (req.user) {
    const userId = req.user.oid || req.user.sub;
    if (userId) context.userId = userId;

    const userName = req.user.preferred_username || req.user.name;
    if (userName) context.userName = userName;

    const userEmail = (req.user as Record<string, unknown>).email as string | undefined || req.user.upn;
    if (userEmail) context.userEmail = userEmail;

    if (req.user.tid) context.tenantId = req.user.tid;
  }

  // Extract authorization context from JWT token
  // req.authInfo contains the full token payload including roles and scopes
  if (req.authInfo) {
    if (req.authInfo.roles) context.roles = req.authInfo.roles;

    // Convert space-delimited scope string to array
    if (req.authInfo.scp) {
      context.scopes = req.authInfo.scp.split(' ');
    }
  }

  // Attach correlation and request IDs to response headers
  // This allows clients to track requests end-to-end
  res.setHeader('X-Correlation-Id', context.correlationId);
  res.setHeader('X-Request-Id', context.requestId);

  // Run the rest of the request within this context
  // All async operations will have access to this context via getRequestContext()
  asyncLocalStorage.run(context, () => {
    next();
  });
}

/**
 * Get the current request context
 *
 * Returns the RequestContext for the current async execution context.
 * This can be called from anywhere within a request handler (controllers, services, etc.)
 * without explicitly passing the context as a parameter.
 *
 * @returns The current RequestContext or undefined if not within a request context
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}
