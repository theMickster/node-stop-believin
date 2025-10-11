import { AuthorBookRole } from '@data/entities/book-author.type';

export interface UpdateBookDto {
  id: string;
  name: string;
  authors: UpdateBookAuthorDto[];
}

export interface UpdateBookAuthorDto {
  authorId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: AuthorBookRole;
  order: number;
}