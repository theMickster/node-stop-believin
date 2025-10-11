import { AuthorBookRole } from '@data/entities/book-author.type';

export interface ReadBookDto {
  id: string;
  name: string;
  authors: ReadAuthorDto[]
}

export interface ReadAuthorDto {
  authorId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: AuthorBookRole;
  order: number;
}