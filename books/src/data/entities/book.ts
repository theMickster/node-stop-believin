import { Author } from './author';

export interface Book {
  id: string;
  bookId: string;
  entityType: string;
  name: string;
  authors: Author[];
}
