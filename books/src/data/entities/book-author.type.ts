export type AuthorBookRole = 'Author' | 'CoAuthor' | 'Editor' | 'Translator' | 'Illustrator';

/**
 * BookAuthor - embedded type for denormalized author information in Book entity
 * This is NOT a separate document, but a composed type within the Book document
 */
export interface BookAuthor {
  authorId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: AuthorBookRole;
  order: number;
}
