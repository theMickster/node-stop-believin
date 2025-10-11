import { BookAuthor } from '@data/entities/book-author.type';
import { ReadAuthorDto } from '@features/book/models/readBookDto';
import { CreateBookAuthorDto } from '@features/book/models/createBookDto';
import { UpdateBookAuthorDto } from '@features/book/models/updateBookDto';

/**
 * Maps author DTOs or Cosmos DB documents to a BookAuthor entity (embedded in Book)
 * Used when:
 * - Hydrating Book entities from Cosmos DB documents
 * - Converting DTOs (CreateBookAuthorDto, UpdateBookAuthorDto) to entities
 */
export function mapToBookAuthor(source: CreateBookAuthorDto | UpdateBookAuthorDto | BookAuthor): BookAuthor {
  return {
    authorId: source.authorId,
    firstName: source.firstName,
    lastName: source.lastName,
    order: source.order,
    ...(source.displayName !== undefined && { displayName: source.displayName }),
    ...(source.role !== undefined && { role: source.role }),
  };
}

/**
 * Maps a BookAuthor (embedded in Book entity) to ReadAuthorDto
 * Used when converting Book entities to read DTOs for API responses
 */
export function mapBookAuthorToReadAuthorDto(bookAuthor: BookAuthor): ReadAuthorDto {
  const dto: ReadAuthorDto = {
    authorId: bookAuthor.authorId,
    firstName: bookAuthor.firstName,
    lastName: bookAuthor.lastName,
    order: bookAuthor.order,
  };

  if (bookAuthor.displayName !== undefined) {
    dto.displayName = bookAuthor.displayName;
  }

  if (bookAuthor.role !== undefined) {
    dto.role = bookAuthor.role;
  }

  return dto;
}
