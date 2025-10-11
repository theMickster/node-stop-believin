import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';

export interface TableOfContentsChapter {
  chapterNumber: number;
  title: string;
  pageStart?: number;
  pageEnd?: number;
}

/**
 * BookTableOfContents entity - detailed chapter/section listing
 *
 * Use cases:
 * - Textbooks with 20+ chapters
 * - Technical manuals with detailed structure
 * - Book preview/sample content pages
 * - Navigation for e-readers
 */
export interface BookTableOfContents extends BaseEntity, PartitionedEntity {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK_TABLE_OF_CONTENTS;
  chapters: TableOfContentsChapter[];
  totalChapters: number;
  totalPages?: number;
}
