/**
 * Entity Type Constants
 *
 * These constants define the entityType values used in Cosmos DB partition keys.
 * They are immutable strings used for:
 * - Entity type discrimination in partition queries
 * - Filtering documents by type
 * - Type safety across the application
 *
 * NOT FOR EXPORT - Internal to entities folder only
 */

export const ENTITY_TYPES = {
  // Book-related entities (CosmicReadsBooks container)
  BOOK: 'Book',
  BOOK_REVIEW: 'Review',
  BOOK_EDITION: 'Edition',
  BOOK_READING_LIST: 'ReadingList',
  BOOK_INVENTORY: 'Inventory',
  BOOK_QUOTE: 'Quote',
  BOOK_DISCUSSION: 'Discussion',
  BOOK_PROMOTION: 'Promotion',
  BOOK_RECOMMENDATION: 'Recommendation',
  BOOK_MEDIA: 'Media',

  // Author-related entities (CosmicReadsAuthor container)
  AUTHOR: 'Author',
  AUTHOR_BIOGRAPHY: 'Biography',
  AUTHOR_BOOK: 'AuthorBook',
  AUTHOR_AWARD: 'Award',
  AUTHOR_QUOTE: 'AuthorQuote',
  AUTHOR_INTERVIEW: 'Interview',
  AUTHOR_SOCIAL_POST: 'SocialPost',
  AUTHOR_NOTE: 'Note',
} as const;

/**
 * Union type of all valid entity type values
 */
export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];
