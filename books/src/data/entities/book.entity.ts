import { BookAuthor } from './book-author.type';
import { BaseEntity, PartitionedEntity, SoftDeletable, Versionable } from './base/entity-traits';
import { Rateable, Taggable } from './base/behavioral-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type BookFormat = 'Hardcover' | 'Paperback' | 'eBook' | 'Audiobook' | 'Video' | 'PracticeTest';
export type BookLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'pt' | 'it' | 'ru' | 'ar';
export type BookAvailability = 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued' | 'ComingSoon';
export type AgeRating = 'General' | 'Teen' | 'YoungAdult' | 'Adult' | 'Mature';
export type ReadingLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface ISBN {
  isbn10?: string;
  isbn13?: string;
}

export interface BookPrice {
  amount: number;
  currency: string;
  discountAmount?: number;
  discountPercentage?: number;
  validFrom?: Date;
  validTo?: Date;
}

export interface BookSeries {
  name: string;
  position: number;
  totalBooks?: number;
}

export interface Publisher {
  name: string;
  location?: string;
  website?: string;
}

export interface TableOfContents {
  chapterNumber: number;
  title: string;
  pageStart?: number;
  pageEnd?: number;
  subChapters?: Array<{
    title: string;
    pageStart?: number;
  }>;
}

export interface PurchaseLink {
  provider: string;
  url: string;
  price?: BookPrice;
  availability?: BookAvailability;
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

/**
 * Book root entity - comprehensive book metadata
 *
 * Designed for:
 * - Library catalog systems
 * - Bookstore/e-commerce platforms
 * - Book review/blog platforms
 * - Reading tracking apps
 */
export interface Book extends BaseEntity, PartitionedEntity, SoftDeletable, Versionable, Rateable, Taggable {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK;
  title?: string;
  name: string;
  subtitle?: string;
  isbn?: ISBN;
  authors: BookAuthor[];
  editors?: BookAuthor[];
  translators?: BookAuthor[];
  illustrators?: BookAuthor[];

  publisher?: Publisher;
  publishedDate?: Date;
  edition?: string;
  copyright?: string;

  description?: string;
  shortDescription?: string;
  backCoverText?: string;
  tableOfContents?: TableOfContents[];

  // Format & Physical Properties
  formats?: BookFormat[];
  primaryFormat?: BookFormat;
  language?: BookLanguage;
  originalLanguage?: BookLanguage;

  // Classification
  genres?: string[];
  subjects?: string[];
  topics?: string[];
  categories?: string[]; // Dewey Decimal, Library of Congress, etc.
  keywords?: string[];
  bisacCodes?: string[]; // Book Industry Standards categories
  thema?: string[]; // International subject category scheme

  targetAudience?: string[];
  ageRating?: AgeRating;
  readingLevel?: ReadingLevel;

  prices?: Record<BookFormat, BookPrice>;
  availability?: BookAvailability;
  stockQuantity?: number;
  preOrderDate?: Date;
  discontinuedDate?: Date;

  ratingSummary?: RatingSummary;
  reviewCount?: number;
  featured?: boolean;
  bestseller?: boolean;
  newRelease?: boolean;
  comingSoon?: boolean;

  // Series & Related Books
  series?: BookSeries;

  // Purchase & Distribution
  purchaseLinks?: PurchaseLink[];
  printOnDemand?: boolean;
  drm?: string; // Digital Rights Management info

  // Library-Specific
  deweyDecimal?: string;
  libraryOfCongress?: string;
  lccn?: string; // Library of Congress Control Number
  oclcNumber?: string; // WorldCat identifier
  callNumber?: string;

  // Technical & E-commerce
  sku?: string;
  barcode?: string;
  amazonBooksId?: string;
  googleBooksId?: string;
  openLibraryId?: string;

  // Sales & Analytics
  totalSales?: number;
  viewCount?: number;
  wishlistCount?: number;
  downloadCount?: number;
  firstPublishedDate?: Date;
  lastModifiedDate?: Date;

  // User Engagement (aggregated)
  readCount?: number; // How many users marked as "read"
  currentlyReadingCount?: number;
  wantToReadCount?: number;
  favoritesCount?: number;
}
