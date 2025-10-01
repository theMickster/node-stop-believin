import { AuthorBookRole } from './author-book.entity';

/**
 * BookAuthor - embedded type for denormalized author information in Book entity
 * This is NOT a separate document, but a composed type within the Book document
 * Stored in CosmicReadsBooks container
 */
export interface BookAuthor {
  authorId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: AuthorBookRole;
  order: number;
}
