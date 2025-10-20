import { Request } from 'express';
import httpMocks from 'node-mocks-http';

/**
 * Create a mock request with params and body
 * @template P - Params type
 * @template B - Body type
 */
export function mockRequestWithBody<
  P extends Record<string, string> = Record<string, string>,
  B extends httpMocks.Body = httpMocks.Body
>(params: P, body: B): Request<P, unknown, B> {
  return httpMocks.createRequest({
    params,
    body,
  }) as unknown as Request<P, unknown, B>;
}

/**
 * Create a mock request with only params
 * @template P - Params type
 */
export function mockRequestWithParams<P extends Record<string, string> = Record<string, string>>(
  params: P
): Request<P> {
  return httpMocks.createRequest({
    params,
  }) as unknown as Request<P>;
}

/**
 * Create a mock request with only query params
 * @template Q - Query type
 */
export function mockRequestWithQuery<Q extends Record<string, unknown> = Record<string, unknown>>(
  query: Q
): Request {
  return httpMocks.createRequest({
    query,
  }) as Request;
}

/**
 * Create an empty mock request
 */
export function mockEmptyRequest(): Request {
  return httpMocks.createRequest() as Request;
}
