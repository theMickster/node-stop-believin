import { AuthorRole } from '@data/entities/metadata/authorRole.type';

export interface CreateBookDto {
  name: string;
  authors: CreateBookAuthorDto[];
}

export interface CreateBookAuthorDto {
  authorId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: AuthorRole;
  order: number;
}
