import { Request } from 'express';

import { PAGINATION_DEFAULTS } from '@libs/types/pagination.types';

import { parsePaginationParams } from './paginationHelper';

describe('parsePaginationParams', () => {
  const createMockRequest = (query: Record<string, string>): Request => {
    return {
      query,
    } as unknown as Request;
  };

  describe('with valid parameters', () => {
    it('should parse valid page and pageSize', () => {
      const req = createMockRequest({ page: '2', pageSize: '25' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: 2,
        pageSize: 25,
      });
    });

    it('should handle string numbers correctly', () => {
      const req = createMockRequest({ page: '10', pageSize: '50' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: 10,
        pageSize: 50,
      });
    });
  });

  describe('with missing parameters', () => {
    it('should use defaults when no query params provided', () => {
      const req = createMockRequest({});
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: PAGINATION_DEFAULTS.PAGE,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      });
    });

    it('should use default page when only pageSize provided', () => {
      const req = createMockRequest({ pageSize: '20' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: PAGINATION_DEFAULTS.PAGE,
        pageSize: 20,
      });
    });

    it('should use default pageSize when only page provided', () => {
      const req = createMockRequest({ page: '3' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: 3,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      });
    });
  });

  describe('with invalid parameters', () => {
    it('should use defaults for non-numeric values', () => {
      const req = createMockRequest({ page: 'abc', pageSize: 'xyz' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: PAGINATION_DEFAULTS.PAGE,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      });
    });

    it('should use defaults for negative numbers', () => {
      const req = createMockRequest({ page: '-1', pageSize: '-10' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: PAGINATION_DEFAULTS.PAGE,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      });
    });

    it('should use defaults for zero values', () => {
      const req = createMockRequest({ page: '0', pageSize: '0' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: PAGINATION_DEFAULTS.PAGE,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      });
    });

    it('should use defaults for decimal numbers', () => {
      const req = createMockRequest({ page: '1.5', pageSize: '10.7' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: PAGINATION_DEFAULTS.PAGE,
        pageSize: PAGINATION_DEFAULTS.PAGE_SIZE,
      });
    });
  });

  describe('with max page size enforcement', () => {
    it('should enforce maximum page size limit', () => {
      const req = createMockRequest({ page: '1', pageSize: '200' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: 1,
        pageSize: PAGINATION_DEFAULTS.MAX_PAGE_SIZE,
      });
    });

    it('should allow page size at exactly the maximum', () => {
      const req = createMockRequest({ page: '1', pageSize: '100' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: 1,
        pageSize: 100,
      });
    });

    it('should enforce max even with extremely large values', () => {
      const req = createMockRequest({ page: '1', pageSize: '999999' });
      const result = parsePaginationParams(req);

      expect(result).toEqual({
        page: 1,
        pageSize: PAGINATION_DEFAULTS.MAX_PAGE_SIZE,
      });
    });
  });
});
