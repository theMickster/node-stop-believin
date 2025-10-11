import { AuthorBookRole } from '@data/entities/book-author.type';

export interface CreateBookDto {
  name: string;
  authors: CreateBookAuthorDto[]
}

export interface CreateBookAuthorDto {
  authorId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: AuthorBookRole;
  order: number;
}