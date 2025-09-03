import { ExecutionContext } from '@middleware/requestContext';

/**
 * Builder for creating mock ExecutionContext for testing
 */
export class ExecutionContextMockBuilder {
  private readonly context: ExecutionContext;

  constructor() {
    // Default mock context with all required fields
    this.context = {
      correlationId: 'test-correlation-id',
      requestId: 'test-request-id',
      timestamp: new Date('2024-01-01T00:00:00Z'),
      method: 'POST',
      path: '/test',
      userId: 'test-user-id',
      displayName: 'Test User',
      userName: 'test.user@example.com',
      roles: [],
      clientIp: '127.0.0.1',
      userAgent: 'jest-test',
    };
  }

  withUserId(userId: string): this {
    this.context.userId = userId;
    return this;
  }

  withDisplayName(displayName: string): this {
    this.context.displayName = displayName;
    return this;
  }

  withUserName(userName: string): this {
    this.context.userName = userName;
    return this;
  }

  withUserEmail(userEmail: string): this {
    this.context.userEmail = userEmail;
    return this;
  }

  withTimestamp(timestamp: Date): this {
    this.context.timestamp = timestamp;
    return this;
  }

  withCorrelationId(correlationId: string): this {
    this.context.correlationId = correlationId;
    return this;
  }

  withRequestId(requestId: string): this {
    this.context.requestId = requestId;
    return this;
  }

  withSessionId(sessionId: string): this {
    this.context.sessionId = sessionId;
    return this;
  }

  withIdempotencyKey(idempotencyKey: string): this {
    this.context.idempotencyKey = idempotencyKey;
    return this;
  }

  withRoles(...roles: string[]): this {
    this.context.roles = roles;
    return this;
  }

  withLanguage(language: string): this {
    this.context.language = language;
    return this;
  }

  withCountry(country: string): this {
    this.context.country = country;
    return this;
  }

  withDeviceType(deviceType: string): this {
    this.context.deviceType = deviceType;
    return this;
  }

  build(): ExecutionContext {
    return this.context;
  }
}

/**
 * Create a mock ExecutionContext with default test values
 */
export function buildMockExecutionContext(): ExecutionContextMockBuilder {
  return new ExecutionContextMockBuilder();
}
