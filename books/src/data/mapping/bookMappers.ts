import { Book } from '@data/entities/book.entity';
import { CreateBookDto } from '@features/book/models/createBookDto';
import { mapToBookAuthor, mapBookAuthorToReadAuthorDto } from './authorMappers';
import { UpdateBookDto } from '@features/book/models/updateBookDto';
import { ReadBookDto } from '@features/book/models/readBookDto';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';

const BOOK_ENTITY_TYPE = ENTITY_TYPES.BOOK;

export function mapCreateDtoToBook(newId: string, dto: CreateBookDto): Book {
  return {
    id: newId,
    bookId: newId,
    entityType: BOOK_ENTITY_TYPE,
    name: dto.name,
    authors: Array.isArray(dto.authors) ? dto.authors.map(mapToBookAuthor) : [],
    createdAt: new Date('2024-01-01'),
    createdBy: 'test-user',
    updatedAt: new Date('2024-01-01'),
    updatedBy: 'test-user',
    isDeleted: false,
    version: 1,
  };
}

export function mapUpdateDtoToBook(dto: UpdateBookDto): Book {
  return {
    id: dto.id,
    bookId: dto.id,
    entityType: BOOK_ENTITY_TYPE,
    name: dto.name,
    authors: Array.isArray(dto.authors) ? dto.authors.map(mapToBookAuthor) : [],
    createdAt: new Date('2024-01-01'),
    createdBy: 'test-user',
    updatedAt: new Date('2024-01-01'),
    updatedBy: 'test-user',
    isDeleted: false,
    version: 1,
  };
}

export function mapBookToReadBookDto(book: Book): ReadBookDto {
  return {
    id: book.id,
    name: book.name,
    authors: Array.isArray(book.authors) ? book.authors.map(mapBookAuthorToReadAuthorDto) : [],
  };
}
