import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';
import { BookFormat, ISBN, BookPrice } from './book.entity';

/**
 * BookEdition entity - different editions/formats of the same book
 * Examples:
 * - 1st Edition vs 2nd Edition
 * - Hardcover vs Paperback vs eBook
 * - Special Anniversary Edition
 * - International Editions
 */
export interface BookEdition extends BaseEntity, PartitionedEntity {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK_EDITION;
  editionName: string;
  editionNumber?: number;
  format: BookFormat;
  isbn: ISBN;
  publishedDate: Date;
  publisher: string;
  printRun?: number;
  discontinued: boolean;

  pageCount?: number;
  price: BookPrice;
  msrp?: number;
  inStock: boolean;
  stockQuantity?: number;
  preOrder: boolean;
  releaseDate?: Date;

  notes?: string;

  sku?: string;
  barcode?: string;
  asin?: string;
}
