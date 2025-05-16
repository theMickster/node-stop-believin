import { Book } from "@data/entities/book";
import { CreateBookDto } from "@features/book/models/createBookDto";
import { mapToAuthor } from "./authorMappers";

const BOOK_ENTITY_TYPE = 'Book';

export function mapCreateDtoToBook(newId: string, dto: CreateBookDto): Book {
  return {
    id: newId,
    bookId: newId,
    entityType: BOOK_ENTITY_TYPE,
    name: dto.name,
    authors: Array.isArray(dto.authors) ? dto.authors.map(mapToAuthor) : [],
  };
}

export function mapCosmosDocumentToBook(document: any): Book {
  return {
    id: document.id,
    bookId: document.bookId,
    entityType: document.entityType,
    name: document.name,
    authors: Array.isArray(document.authors) ? document.authors.map(mapToAuthor) : [],
  };
}
