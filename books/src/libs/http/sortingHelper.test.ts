import { Request } from 'express';

import { ISortSpecification, SortDirection } from '@libs/types/sorting.types';

import { parseSortParams } from './sortingHelper';

// Mock specification for testing
interface TestEntity {
  testId: string;
  testName: string;
  createdDate: Date;
}

class TestSortSpecification implements ISortSpecification<TestEntity> {
  readonly allowedFields = new Map([
    ['id', 'c.testId'],
    ['name', 'c.testName'],
    ['date', 'c.createdDate'],
  ]);

  readonly defaultField = 'name';
  readonly defaultDirection = SortDirection.ASC;

  isFieldAllowed(field: string): boolean {
    return this.allowedFields.has(field);
  }

  getDbFieldPath(field: string): string | undefined {
    return this.allowedFields.get(field);
  }
}

describe('parseSortParams', () => {
  const specification = new TestSortSpecification();

  const createMockRequest = (query: Record<string, string>): Request => {
    return {
      query,
    } as unknown as Request;
  };

  describe('with valid parameters', () => {
    it('should parse valid sortBy and sortOrder', () => {
      const req = createMockRequest({ sortBy: 'id', sortOrder: 'desc' });
      const result = parseSortParams(req, specification);

      expect(result).toEqual({
        dbFieldPath: 'c.testId',
        direction: SortDirection.DESC,
      });
    });

    it('should parse ascending order', () => {
      const req = createMockRequest({ sortBy: 'name', sortOrder: 'asc' });
      const result = parseSortParams(req, specification);

      expect(result).toEqual({
        dbFieldPath: 'c.testName',
        direction: SortDirection.ASC,
      });
    });

    it('should handle case-insensitive sort direction', () => {
      const req = createMockRequest({ sortBy: 'date', sortOrder: 'DESC' });
      const result = parseSortParams(req, specification);

      expect(result).toEqual({
        dbFieldPath: 'c.createdDate',
        direction: SortDirection.DESC,
      });
    });

    it('should accept "ascending" as sort direction', () => {
      const req = createMockRequest({ sortBy: 'id', sortOrder: 'ascending' });
      const result = parseSortParams(req, specification);

      expect(result.direction).toBe(SortDirection.ASC);
    });

    it('should accept "descending" as sort direction', () => {
      const req = createMockRequest({ sortBy: 'id', sortOrder: 'descending' });
      const result = parseSortParams(req, specification);

      expect(result.direction).toBe(SortDirection.DESC);
    });
  });

  describe('with missing parameters', () => {
    it('should use defaults when no query params provided', () => {
      const req = createMockRequest({});
      const result = parseSortParams(req, specification);

      expect(result).toEqual({
        dbFieldPath: 'c.testName',
        direction: SortDirection.ASC,
      });
    });

    it('should use default direction when only sortBy provided', () => {
      const req = createMockRequest({ sortBy: 'id' });
      const result = parseSortParams(req, specification);

      expect(result).toEqual({
        dbFieldPath: 'c.testId',
        direction: SortDirection.ASC,
      });
    });

    it('should use default field when only sortOrder provided', () => {
      const req = createMockRequest({ sortOrder: 'desc' });
      const result = parseSortParams(req, specification);

      expect(result).toEqual({
        dbFieldPath: 'c.testName',
        direction: SortDirection.DESC,
      });
    });
  });

  describe('with invalid parameters', () => {
    it('should fall back to defaults for invalid field name', () => {
      const req = createMockRequest({ sortBy: 'invalidField', sortOrder: 'asc' });
      const result = parseSortParams(req, specification);

      expect(result).toEqual({
        dbFieldPath: 'c.testName',
        direction: SortDirection.ASC,
      });
    });

    it('should fall back to default direction for invalid sort order', () => {
      const req = createMockRequest({ sortBy: 'id', sortOrder: 'invalid' });
      const result = parseSortParams(req, specification);

      expect(result).toEqual({
        dbFieldPath: 'c.testId',
        direction: SortDirection.ASC,
      });
    });

    it('should handle empty string sort order', () => {
      const req = createMockRequest({ sortBy: 'name', sortOrder: '' });
      const result = parseSortParams(req, specification);

      expect(result).toEqual({
        dbFieldPath: 'c.testName',
        direction: SortDirection.ASC,
      });
    });
  });

  describe('specification validation', () => {
    it('should only allow fields defined in specification', () => {
      const req1 = createMockRequest({ sortBy: 'id' });
      const result1 = parseSortParams(req1, specification);
      expect(result1.dbFieldPath).toBe('c.testId');

      const req2 = createMockRequest({ sortBy: 'unauthorizedField' });
      const result2 = parseSortParams(req2, specification);
      expect(result2.dbFieldPath).toBe('c.testName'); // Falls back to default
    });

    it('should correctly map allowed fields to database paths', () => {
      expect(specification.getDbFieldPath('id')).toBe('c.testId');
      expect(specification.getDbFieldPath('name')).toBe('c.testName');
      expect(specification.getDbFieldPath('date')).toBe('c.createdDate');
      expect(specification.getDbFieldPath('notAllowed')).toBeUndefined();
    });

    it('should correctly identify allowed fields', () => {
      expect(specification.isFieldAllowed('id')).toBe(true);
      expect(specification.isFieldAllowed('name')).toBe(true);
      expect(specification.isFieldAllowed('date')).toBe(true);
      expect(specification.isFieldAllowed('notAllowed')).toBe(false);
    });
  });
});
