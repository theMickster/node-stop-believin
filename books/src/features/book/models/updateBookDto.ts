import { AuthorRole } from '@data/entities/metadata/authorRole.type';

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
  role?: AuthorRole;
  order: number;
}
