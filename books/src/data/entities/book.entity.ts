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

export interface LibraryClassification {
  deweyDecimal?: string;
  libraryOfCongressNumber?: string;
  oclcNumber?: string;
}

export interface ExternalIds {
  amazonBooksId?: string;
  googleBooksId?: string;
  openLibraryId?: string;
  goodreadsId?: string;
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

  // Format & Physical Properties
  language?: BookLanguage;
  originalLanguage?: BookLanguage;

  // Classification
  genres?: string[];
  subjects?: string[];
  topics?: string[];
  keywords?: string[];
  bisacCodes?: string[]; // Book Industry Standards categories
  thema?: string[]; // International subject category scheme

  targetAudience?: string[];
  ageRating?: AgeRating;
  readingLevel?: ReadingLevel;

  ratingSummary?: RatingSummary;
  series?: BookSeries;
  libraryClassification?: LibraryClassification;
  externalIds?: ExternalIds;
  firstPublishedDate?: Date;
}
