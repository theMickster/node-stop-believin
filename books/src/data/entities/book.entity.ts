import { BookAuthor } from './book-author.type';

export interface Book {
  id: string;
  bookId: string;
  entityType: string;
  name: string;
  authors: BookAuthor[];
}
