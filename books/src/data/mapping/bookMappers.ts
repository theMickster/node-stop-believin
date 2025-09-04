import { ExecutionContext } from '@middleware/requestContext';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';

import { CreateBookDto } from '@features/book/models/createBookDto';
import { ReadBookDto, PublicationInfoDto, ClassificationInfoDto } from '@features/book/models/readBookDto';
import { UpdateBookDto } from '@features/book/models/updateBookDto';

import { mapToBookAuthor, mapBookAuthorToReadAuthorDto } from './bookAuthorMappers';


const BOOK_ENTITY_TYPE = ENTITY_TYPES.BOOK;

export function mapCreateDtoToBook(newId: string, dto: CreateBookDto, context: ExecutionContext): Book {
  const timestamp = context.timestamp;
  const userId = context.userId ?? 'system';

  return {
    id: newId,
    bookId: newId,
    entityType: BOOK_ENTITY_TYPE,
    name: dto.name,
    authors: Array.isArray(dto.authors) ? dto.authors.map(mapToBookAuthor) : [],
    createdAt: timestamp,
    createdBy: userId,
    updatedAt: timestamp,
    updatedBy: userId,
    isDeleted: false,
    version: 1,
  };
}

export function mapUpdateDtoToBook(existingBook: Book, dto: UpdateBookDto, context: ExecutionContext): Book {
  const timestamp = context.timestamp;
  const userId = context.userId ?? 'system';

  return {
    ...existingBook,
    name: dto.name,
    authors: Array.isArray(dto.authors) ? dto.authors.map(mapToBookAuthor) : [],
    updatedAt: timestamp,
    updatedBy: userId,
    version: existingBook.version + 1,
  };
}

function buildPublicationInfo(book: Book): PublicationInfoDto | undefined {
  const hasPublicationInfo =
    book.publishedDate || book.isbn || book.publisher || book.edition || book.copyright || book.firstPublishedDate;

  if (!hasPublicationInfo) {
    return undefined;
  }

  // Helper to safely convert date to ISO string
  const toISOStringSafe = (date: Date | string | undefined): string | undefined => {
    if (!date) return undefined;
    if (typeof date === 'string') return date;
    return date.toISOString();
  };

  const publishedDateStr = toISOStringSafe(book.publishedDate);
  const firstPublishedDateStr = toISOStringSafe(book.firstPublishedDate);

  return {
    ...(book.isbn && { isbn: book.isbn }),
    ...(publishedDateStr && { publishedDate: publishedDateStr }),
    ...(firstPublishedDateStr && { firstPublishedDate: firstPublishedDateStr }),
    ...(book.copyright && { copyright: book.copyright }),
    ...(book.edition && { edition: book.edition }),
    isPublished: !!book.publishedDate,
    ...(book.publisher && { publisher: book.publisher }),
  };
}

function buildClassificationInfo(book: Book): ClassificationInfoDto | undefined {
  const hasClassificationInfo =
    book.genres ||
    book.subjects ||
    book.bisacCodes ||
    book.thema ||
    book.libraryClassification ||
    book.ageRating ||
    book.readingLevel;

  if (!hasClassificationInfo) {
    return undefined;
  }

  return {
    ...(book.genres && { genres: book.genres }),
    ...(book.subjects && { subjects: book.subjects }),
    ...(book.bisacCodes && { bisacCodes: book.bisacCodes }),
    ...(book.thema && { thema: book.thema }),
    ...(book.libraryClassification && { libraryClassification: book.libraryClassification }),
    ...(book.ageRating && { ageRating: book.ageRating }),
    ...(book.readingLevel && { readingLevel: book.readingLevel }),
  };
}

export function mapBookToReadBookDto(book: Book): ReadBookDto {
  const publicationInfo = buildPublicationInfo(book);
  const classificationInfo = buildClassificationInfo(book);

  return {
    id: book.id,
    name: book.name,
    authors: Array.isArray(book.authors) ? book.authors.map(mapBookAuthorToReadAuthorDto) : [],
    ...(publicationInfo && { publicationInfo }),
    ...(classificationInfo && { classificationInfo }),
  };
}
