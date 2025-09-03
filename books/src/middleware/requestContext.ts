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
 * - Client context (language, country, device)
 * - Session and idempotency tracking
 */
export interface RequestContext {
  // Tracking
  /** Correlation ID for tracking requests across distributed systems. Can be provided by client via X-Correlation-Id header */
  correlationId: string;

  /** Unique ID for this specific request */
  requestId: string;

  /** Session ID for grouping related requests from the same user session. Can be provided by client via X-Session-Id header */
  sessionId?: string;

  /** Idempotency key for safe request retries. Provided by client via Idempotency-Key header (recommended for POST/PUT/DELETE) */
  idempotencyKey?: string;

  // Temporal
  /** Request start timestamp - use this for createdAt/updatedAt to ensure consistency */
  timestamp: Date;

  // HTTP Context
  /** HTTP method (GET, POST, etc.) */
  method: string;

  /** Request path */
  path: string;

  // Identity
  /** User ID from JWT token (oid or sub claim) */
  userId?: string;

  /** User display name from JWT token (constructed from given_name + family_name, or name claim) */
  displayName?: string;

  /** User name from JWT token (preferred_username, upn, or unique_name claim) */
  userName?: string;

  /** User email from JWT token (email or upn claim) */
  userEmail?: string;

  /** Azure AD Tenant ID from JWT token (tid claim) */
  tenantId?: string;

  // Authorization
  /** User roles from JWT token (roles claim array) */
  roles?: string[];

  /** OAuth scopes from JWT token (scp claim, space-delimited string converted to array) */
  scopes?: string[];

  // Client Context
  /** Client IP address */
  clientIp?: string;

  /** User agent string from request headers */
  userAgent?: string;

  /** Preferred language from Accept-Language header (e.g., 'en-US', 'fr-FR') */
  language?: string;

  /** Country code derived from IP geolocation or X-Country header (e.g., 'US', 'FR', 'GB') */
  country?: string;

  /** Device type parsed from user agent (e.g., 'mobile', 'tablet', 'desktop') */
  deviceType?: string;
}

/**
 * ExecutionContext
 * Alias for RequestContext - provides a cleaner name when injecting via @ExecutionContext() decorator
 */
export type ExecutionContext = RequestContext;

/**
 * Extended Express Request interface with ExecutionContext
 * This allows us to attach the context to the request object itself
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      executionContext?: RequestContext;
    }
  }
}

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
  // Create base context with tracking IDs
  const context: RequestContext = {
    correlationId: (req.headers['x-correlation-id'] as string) || uuidv4(),
    requestId: uuidv4(),
    timestamp: new Date(),
    method: req.method,
    path: req.path,
  };

  // Extract session ID and idempotency key from headers
  const sessionId = req.headers['x-session-id'] as string;
  if (sessionId) context.sessionId = sessionId;

  const idempotencyKey = req.headers['idempotency-key'] as string;
  if (idempotencyKey) context.idempotencyKey = idempotencyKey;

  // Extract client context
  const clientIp = req.ip || req.socket.remoteAddress;
  if (clientIp) context.clientIp = clientIp;

  const userAgent = req.headers['user-agent'];
  if (userAgent) {
    context.userAgent = userAgent;
    context.deviceType = parseDeviceType(userAgent);
  }

  // Extract language preference
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    context.language = acceptLanguage.split(',')[0].trim();
  }

  // Extract country from header (if provided by client or API gateway)
  const country = req.headers['x-country'] as string;
  if (country) context.country = country;

  // Extract user identity from JWT token if authenticated
  // req.user is populated by passport-azure-ad after successful authentication
  if (req.user) {
    extractUserIdentity(req.user, context);
  }

  // Extract authorization context from JWT token
  // req.authInfo contains the full token payload including roles and scopes
  if (req.authInfo) {
    extractAuthorizationContext(req.authInfo, context);
  }

  // Attach the context to the request object for access in controllers
  req.executionContext = context;

  // Attach tracking IDs to response headers for client-side correlation
  res.setHeader('X-Correlation-Id', context.correlationId);
  res.setHeader('X-Request-Id', context.requestId);
  if (context.sessionId) {
    res.setHeader('X-Session-Id', context.sessionId);
  }

  // Continue with the request
  next();
}

/**
 * Extract user identity information from JWT token
 */
function extractUserIdentity(user: Express.User, context: RequestContext): void {
  // User ID (oid is Azure AD Object ID, sub is subject claim)
  const userId = user.oid || user.sub;
  if (userId) context.userId = userId;

  // Display name - prefer given_name + family_name, fallback to name claim
  const givenName = user.given_name;
  const familyName = user.family_name;
  if (givenName && familyName) {
    context.displayName = `${givenName} ${familyName}`;
  } else if (user.name) {
    context.displayName = user.name;
  } else if (user.preferred_username) {
    context.displayName = user.preferred_username;
  }

  // User name - prefer UPN (User Principal Name), fallback to preferred_username
  const userName = user.upn || user.preferred_username || user.unique_name;
  if (userName) context.userName = userName;

  // Email - explicit email claim, fallback to UPN
  const userEmail = (user as Record<string, unknown>).email as string | undefined || user.upn;
  if (userEmail) context.userEmail = userEmail;

  // Tenant ID
  if (user.tid) context.tenantId = user.tid;
}

/**
 * Extract authorization context from JWT token
 */
function extractAuthorizationContext(authInfo: Express.AuthInfo, context: RequestContext): void {
  // Roles array
  if (authInfo.roles) context.roles = authInfo.roles;

  // Convert space-delimited scope string to array
  if (authInfo.scp) {
    context.scopes = authInfo.scp.split(' ');
  }
}

/**
 * Parse device type from user agent string
 * Simple heuristic - can be enhanced with a library like 'ua-parser-js' if needed
 */
function parseDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Get the current request context from the Express request object
 *
 * This function should be called from within the request-response cycle,
 * typically in the routeBuilder when injecting context via @ExecutionContext() decorator.
 *
 * @param req - Express request object
 * @returns The current RequestContext or undefined if not set
 */
export function getRequestContext(req: Request): RequestContext | undefined {
  return req.executionContext;
}
