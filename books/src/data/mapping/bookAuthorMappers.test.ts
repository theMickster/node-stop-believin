import { BookAuthor } from '@data/entities/book.entity';

import { CreateBookAuthorDto } from '@features/book/models/createBookDto';
import { UpdateBookAuthorDto } from '@features/book/models/updateBookDto';

import { mapToBookAuthor, mapBookAuthorToReadAuthorDto } from './bookAuthorMappers';

describe('bookAuthorMappers', () => {
  describe('mapToBookAuthor', () => {
    describe('from CreateBookAuthorDto', () => {
      it('should map CreateBookAuthorDto with all fields', () => {
        const dto: CreateBookAuthorDto = {
          authorId: 'author-123',
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'J. Doe',
          role: 'Author',
          order: 1,
        };

        const result = mapToBookAuthor(dto);

        expect(result).toEqual({
          authorId: 'author-123',
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'J. Doe',
          role: 'Author',
          order: 1,
        });
      });

      it('should map CreateBookAuthorDto with required fields only', () => {
        const dto: CreateBookAuthorDto = {
          authorId: 'author-456',
          firstName: 'Jane',
          lastName: 'Smith',
          order: 2,
        };

        const result = mapToBookAuthor(dto);

        expect(result).toEqual({
          authorId: 'author-456',
          firstName: 'Jane',
          lastName: 'Smith',
          order: 2,
        });
        expect(result.displayName).toBeUndefined();
        expect(result.role).toBeUndefined();
      });

      it('should map CreateBookAuthorDto with displayName but no role', () => {
        const dto: CreateBookAuthorDto = {
          authorId: 'author-789',
          firstName: 'Alice',
          lastName: 'Johnson',
          displayName: 'Dr. Alice Johnson',
          order: 1,
        };

        const result = mapToBookAuthor(dto);

        expect(result).toEqual({
          authorId: 'author-789',
          firstName: 'Alice',
          lastName: 'Johnson',
          displayName: 'Dr. Alice Johnson',
          order: 1,
        });
        expect(result.role).toBeUndefined();
      });

      it('should map CreateBookAuthorDto with role but no displayName', () => {
        const dto: CreateBookAuthorDto = {
          authorId: 'author-012',
          firstName: 'Bob',
          lastName: 'Williams',
          role: 'CoAuthor',
          order: 2,
        };

        const result = mapToBookAuthor(dto);

        expect(result).toEqual({
          authorId: 'author-012',
          firstName: 'Bob',
          lastName: 'Williams',
          role: 'CoAuthor',
          order: 2,
        });
        expect(result.displayName).toBeUndefined();
      });
    });

    describe('from UpdateBookAuthorDto', () => {
      it('should map UpdateBookAuthorDto with all fields', () => {
        const dto: UpdateBookAuthorDto = {
          authorId: 'author-update-1',
          firstName: 'Updated',
          lastName: 'Author',
          displayName: 'Updated A.',
          role: 'Author',
          order: 1,
        };

        const result = mapToBookAuthor(dto);

        expect(result).toEqual({
          authorId: 'author-update-1',
          firstName: 'Updated',
          lastName: 'Author',
          displayName: 'Updated A.',
          role: 'Author',
          order: 1,
        });
      });

      it('should map UpdateBookAuthorDto with required fields only', () => {
        const dto: UpdateBookAuthorDto = {
          authorId: 'author-update-2',
          firstName: 'Simple',
          lastName: 'Update',
          order: 3,
        };

        const result = mapToBookAuthor(dto);

        expect(result).toEqual({
          authorId: 'author-update-2',
          firstName: 'Simple',
          lastName: 'Update',
          order: 3,
        });
        expect(result.displayName).toBeUndefined();
        expect(result.role).toBeUndefined();
      });
    });

    describe('from BookAuthor entity', () => {
      it('should map BookAuthor entity with all fields', () => {
        const entity: BookAuthor = {
          authorId: 'author-entity-1',
          firstName: 'Entity',
          lastName: 'Author',
          displayName: 'Prof. Entity Author',
          role: 'CoAuthor',
          order: 2,
        };

        const result = mapToBookAuthor(entity);

        expect(result).toEqual({
          authorId: 'author-entity-1',
          firstName: 'Entity',
          lastName: 'Author',
          displayName: 'Prof. Entity Author',
          role: 'CoAuthor',
          order: 2,
        });
      });

      it('should map BookAuthor entity with required fields only', () => {
        const entity: BookAuthor = {
          authorId: 'author-entity-2',
          firstName: 'Minimal',
          lastName: 'Entity',
          order: 1,
        };

        const result = mapToBookAuthor(entity);

        expect(result).toEqual({
          authorId: 'author-entity-2',
          firstName: 'Minimal',
          lastName: 'Entity',
          order: 1,
        });
        expect(result.displayName).toBeUndefined();
        expect(result.role).toBeUndefined();
      });

      it('should hydrate from Cosmos DB document with all fields', () => {
        const cosmosDoc: BookAuthor = {
          authorId: 'cosmos-author-1',
          firstName: 'Cosmos',
          lastName: 'Author',
          displayName: 'Dr. Cosmos',
          role: 'Editor',
          order: 1,
        };

        const result = mapToBookAuthor(cosmosDoc);

        expect(result).toEqual(cosmosDoc);
      });
    });

    describe('edge cases', () => {
      it('should handle order value of 0', () => {
        const dto: CreateBookAuthorDto = {
          authorId: 'author-zero',
          firstName: 'Zero',
          lastName: 'Order',
          order: 0,
        };

        const result = mapToBookAuthor(dto);

        expect(result.order).toBe(0);
      });

      it('should handle large order values', () => {
        const dto: CreateBookAuthorDto = {
          authorId: 'author-large',
          firstName: 'Large',
          lastName: 'Order',
          order: 999,
        };

        const result = mapToBookAuthor(dto);

        expect(result.order).toBe(999);
      });

      it('should handle empty string displayName', () => {
        const dto: CreateBookAuthorDto = {
          authorId: 'author-empty',
          firstName: 'Empty',
          lastName: 'DisplayName',
          displayName: '',
          order: 1,
        };

        const result = mapToBookAuthor(dto);

        expect(result.displayName).toBe('');
      });

      it('should handle undefined role', () => {
        const dto: CreateBookAuthorDto = {
          authorId: 'author-empty-role',
          firstName: 'Empty',
          lastName: 'Role',
          order: 1,
        };

        const result = mapToBookAuthor(dto);

        expect(result.role).toBeUndefined();
      });
    });
  });

  describe('mapBookAuthorToReadAuthorDto', () => {
    it('should map BookAuthor with all fields to ReadAuthorDto', () => {
      const bookAuthor: BookAuthor = {
        authorId: 'read-author-1',
        firstName: 'Read',
        lastName: 'Author',
        displayName: 'Dr. Read Author',
        role: 'Author',
        order: 1,
      };

      const result = mapBookAuthorToReadAuthorDto(bookAuthor);

      expect(result).toEqual({
        authorId: 'read-author-1',
        firstName: 'Read',
        lastName: 'Author',
        displayName: 'Dr. Read Author',
        role: 'Author',
        order: 1,
      });
    });

    it('should map BookAuthor with required fields only to ReadAuthorDto', () => {
      const bookAuthor: BookAuthor = {
        authorId: 'read-author-2',
        firstName: 'Minimal',
        lastName: 'Read',
        order: 2,
      };

      const result = mapBookAuthorToReadAuthorDto(bookAuthor);

      expect(result).toEqual({
        authorId: 'read-author-2',
        firstName: 'Minimal',
        lastName: 'Read',
        order: 2,
      });
      expect(result.displayName).toBeUndefined();
      expect(result.role).toBeUndefined();
    });

    it('should map BookAuthor with displayName but no role', () => {
      const bookAuthor: BookAuthor = {
        authorId: 'read-author-3',
        firstName: 'Display',
        lastName: 'Only',
        displayName: 'Prof. Display Only',
        order: 1,
      };

      const result = mapBookAuthorToReadAuthorDto(bookAuthor);

      expect(result).toEqual({
        authorId: 'read-author-3',
        firstName: 'Display',
        lastName: 'Only',
        displayName: 'Prof. Display Only',
        order: 1,
      });
      expect(result.role).toBeUndefined();
    });

    it('should map BookAuthor with role but no displayName', () => {
      const bookAuthor: BookAuthor = {
        authorId: 'read-author-4',
        firstName: 'Role',
        lastName: 'Only',
        role: 'CoAuthor',
        order: 3,
      };

      const result = mapBookAuthorToReadAuthorDto(bookAuthor);

      expect(result).toEqual({
        authorId: 'read-author-4',
        firstName: 'Role',
        lastName: 'Only',
        role: 'CoAuthor',
        order: 3,
      });
      expect(result.displayName).toBeUndefined();
    });

    it('should handle order value of 0', () => {
      const bookAuthor: BookAuthor = {
        authorId: 'read-zero',
        firstName: 'Zero',
        lastName: 'Order',
        order: 0,
      };

      const result = mapBookAuthorToReadAuthorDto(bookAuthor);

      expect(result.order).toBe(0);
    });

    it('should handle empty string displayName', () => {
      const bookAuthor: BookAuthor = {
        authorId: 'read-empty-display',
        firstName: 'Empty',
        lastName: 'Display',
        displayName: '',
        order: 1,
      };

      const result = mapBookAuthorToReadAuthorDto(bookAuthor);

      expect(result.displayName).toBe('');
    });

    it('should handle undefined role', () => {
      const bookAuthor: BookAuthor = {
        authorId: 'read-empty-role',
        firstName: 'Empty',
        lastName: 'RoleName',
        order: 1,
      };

      const result = mapBookAuthorToReadAuthorDto(bookAuthor);

      expect(result.role).toBeUndefined();
    });

    it('should create a new object without mutating source', () => {
      const bookAuthor: BookAuthor = {
        authorId: 'read-immutable',
        firstName: 'Immutable',
        lastName: 'Test',
        displayName: 'Original Name',
        order: 1,
      };

      const result = mapBookAuthorToReadAuthorDto(bookAuthor);

      // Modify result
      result.firstName = 'Modified';
      result.displayName = 'Modified Name';

      // Original should be unchanged
      expect(bookAuthor.firstName).toBe('Immutable');
      expect(bookAuthor.displayName).toBe('Original Name');
    });

    it('should handle multiple authors in a collection', () => {
      const authors: BookAuthor[] = [
        {
          authorId: 'multi-1',
          firstName: 'First',
          lastName: 'Author',
          displayName: 'Dr. First',
          role: 'Editor',
          order: 1,
        },
        {
          authorId: 'multi-2',
          firstName: 'Second',
          lastName: 'Author',
          order: 2,
        },
        {
          authorId: 'multi-3',
          firstName: 'Third',
          lastName: 'Author',
          role: 'Editor',
          order: 3,
        },
      ];

      const results = authors.map(mapBookAuthorToReadAuthorDto);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({
        authorId: 'multi-1',
        firstName: 'First',
        lastName: 'Author',
        displayName: 'Dr. First',
        role: 'Editor',
        order: 1,
      });
      expect(results[1].displayName).toBeUndefined();
      expect(results[1].role).toBeUndefined();
      expect(results[2].displayName).toBeUndefined();
      expect(results[2].role).toBe('Editor');
    });
  });

  describe('round-trip mapping', () => {
    it('should maintain data integrity in round-trip: CreateDto -> BookAuthor -> ReadDto', () => {
      const createDto: CreateBookAuthorDto = {
        authorId: 'round-trip-1',
        firstName: 'Round',
        lastName: 'Trip',
        displayName: 'Dr. Round Trip',
        role: 'Author',
        order: 1,
      };

      const bookAuthor = mapToBookAuthor(createDto);
      const readDto = mapBookAuthorToReadAuthorDto(bookAuthor);

      expect(readDto).toEqual({
        authorId: createDto.authorId,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        displayName: createDto.displayName,
        role: createDto.role,
        order: createDto.order,
      });
    });

    it('should maintain minimal data in round-trip without optional fields', () => {
      const createDto: CreateBookAuthorDto = {
        authorId: 'round-trip-2',
        firstName: 'Minimal',
        lastName: 'RoundTrip',
        order: 2,
      };

      const bookAuthor = mapToBookAuthor(createDto);
      const readDto = mapBookAuthorToReadAuthorDto(bookAuthor);

      expect(readDto).toEqual({
        authorId: createDto.authorId,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        order: createDto.order,
      });
      expect(readDto.displayName).toBeUndefined();
      expect(readDto.role).toBeUndefined();
    });
  });
});
