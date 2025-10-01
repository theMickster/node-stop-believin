import { BookAuthor } from '@data/entities/book-author.type';

export function mapToBookAuthor(document: any): BookAuthor {
  return {
    authorId: document.authorId,
    firstName: document.firstName,
    lastName: document.lastName,
    order: document.order,
  };
}
