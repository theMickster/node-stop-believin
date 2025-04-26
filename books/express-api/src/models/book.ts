import { Author, mapToAuthor } from "./author";

export interface Book {
    id: string;
    bookId: string;
    entityType: 'Book';
    name: string;
    authors: Author[];
  }

  export function mapToBook(document: any): Book {
    return {
      id: document.id,
      bookId: document.bookId,
      entityType: document.entityType,
      name: document.name,
      authors: Array.isArray(document.authors)
      ? document.authors.map(mapToAuthor)
      : []
    };
  }