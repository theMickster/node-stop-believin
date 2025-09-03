import { DeepMockProxy } from 'jest-mock-extended';

import { ILogger } from '@libs/logging/logger.interface';

// Define the mock response interface with the methods we need
interface MockResponse {
  statusCode: number;
  _getData(): string;
}

// Use the Response type from the mock object returned by node-mocks-http
type Response = ReturnType<typeof import('node-mocks-http').createResponse>;

/**
 * Assert that a controller response has the expected status code and JSON body
 */
export function expectControllerResponse(
  res: Response,
  expectedStatus: number,
  bodyMatcher?: (body: unknown) => void,
): void {
  const mockRes = res as unknown as MockResponse;
  expect(mockRes.statusCode).toBe(expectedStatus);

  if (bodyMatcher) {
    const responseData: unknown = JSON.parse(mockRes._getData());
    bodyMatcher(responseData);
  }
}

/**
 * Assert that a controller returned a successful response (200)
 */
export function expectSuccess<T = unknown>(
  res: Response,
  dataExpectations?: (data: T) => void,
): void {
  expectControllerResponse(res, 200, (body) => {
    if (dataExpectations) {
      dataExpectations(body as T);
    }
  });
}

/**
 * Assert that a controller returned a 201 Created response
 */
export function expectCreated<T = unknown>(
  res: Response,
  dataExpectations?: (data: T) => void,
): void {
  expectControllerResponse(res, 201, (body) => {
    if (dataExpectations) {
      dataExpectations(body as T);
    }
  });
}

/**
 * Assert that a controller returned a 204 No Content response
 */
export function expectNoContent(res: Response): void {
  const mockRes = res as unknown as MockResponse;
  expect(mockRes.statusCode).toBe(204);
}

/**
 * Assert that a controller returned a 400 Bad Request response
 */
export function expectBadRequest(res: Response, messageMatcher?: string | RegExp): void {
  expectControllerResponse(res, 400, (body) => {
    expect(body).toHaveProperty('error');
    if (messageMatcher) {
      const errorBody = body as { error: string | { code: string; message: string } };
      const errorMessage =
        typeof errorBody.error === 'string' ? errorBody.error : errorBody.error.message;
      if (typeof messageMatcher === 'string') {
        expect(errorMessage).toContain(messageMatcher);
      } else {
        expect(errorMessage).toMatch(messageMatcher);
      }
    }
  });
}

/**
 * Assert that a controller returned a 404 Not Found response
 */
export function expectNotFound(res: Response, messageMatcher?: string | RegExp): void {
  expectControllerResponse(res, 404, (body) => {
    expect(body).toHaveProperty('error');
    if (messageMatcher) {
      const errorBody = body as { error: string | { code: string; message: string } };
      const errorMessage =
        typeof errorBody.error === 'string' ? errorBody.error : errorBody.error.message;
      if (typeof messageMatcher === 'string') {
        expect(errorMessage).toContain(messageMatcher);
      } else {
        expect(errorMessage).toMatch(messageMatcher);
      }
    }
  });
}

/**
 * Assert that a controller returned a 409 Conflict response
 */
export function expectConflict(res: Response, messageMatcher?: string | RegExp): void {
  expectControllerResponse(res, 409, (body) => {
    expect(body).toHaveProperty('error');
    if (messageMatcher) {
      const errorBody = body as { error: string | { code: string; message: string } };
      const errorMessage =
        typeof errorBody.error === 'string' ? errorBody.error : errorBody.error.message;
      if (typeof messageMatcher === 'string') {
        expect(errorMessage).toContain(messageMatcher);
      } else {
        expect(errorMessage).toMatch(messageMatcher);
      }
    }
  });
}

/**
 * Assert that a controller returned a 500 Internal Server Error response
 */
export function expectInternalServerError(res: Response, messageMatcher?: string | RegExp): void {
  expectControllerResponse(res, 500, (body) => {
    if (messageMatcher) {
      const hasError = 'error' in (body as object);
      const hasMessage = 'message' in (body as object);

      if (hasError) {
        const errorBody = body as { error: string | { code: string; message: string } };
        const errorMessage =
          typeof errorBody.error === 'string' ? errorBody.error : errorBody.error.message;
        if (typeof messageMatcher === 'string') {
          expect(errorMessage).toContain(messageMatcher);
        } else {
          expect(errorMessage).toMatch(messageMatcher);
        }
      } else if (hasMessage) {
        const messageBody = body as { message: string };
        if (typeof messageMatcher === 'string') {
          expect(messageBody.message).toContain(messageMatcher);
        } else {
          expect(messageBody.message).toMatch(messageMatcher);
        }
      }
    }
  });
}

/**
 * Assert that logger.error was called with expected message
 */
export function expectLoggerError(
  mockLogger: DeepMockProxy<ILogger>,
  message?: string,
  contextMatcher?: (context: unknown) => void,
): void {
  expect(mockLogger.error).toHaveBeenCalled();

  if (message || contextMatcher) {
    const errorCalls = mockLogger.error.mock.calls;
    const lastCall = errorCalls[errorCalls.length - 1];

    if (message) {
      expect(lastCall[0]).toContain(message);
    }

    if (contextMatcher && lastCall[1]) {
      contextMatcher(lastCall[1]);
    }
  }
}

/**
 * Assert that logger.error was called exactly once
 */
export function expectSingleLoggerError(mockLogger: DeepMockProxy<ILogger>): void {
  expect(mockLogger.error).toHaveBeenCalledTimes(1);
}
