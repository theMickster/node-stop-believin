import { AuthorBookRole } from '@data/entities/book-author.type';

export interface ReadBookDto {
  id: string;
  name: string;
  authors: ReadAuthorDto[];
  publicationInfo?: PublicationInfoDto;
  classificationInfo?: ClassificationInfoDto;
}

export interface ReadAuthorDto {
  authorId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: AuthorBookRole;
  order: number;
}
export interface ClassificationInfoDto {
  genres?: string[];
  subjects?: string[];
  bisacCodes?: string[];
  thema?: string[];

  libraryClassification?: {
    deweyDecimal?: string;
    libraryOfCongressNumber?: string;
    oclcNumber?: string;
  };

  ageRating?: string;
  readingLevel?: string;
}

export interface PublicationInfoDto {
  isbn?: {
    isbn10?: string;
    isbn13?: string;
  };
  publishedDate?: string;
  firstPublishedDate?: string;
  copyright?: string;
  edition?: string;
  isPublished: boolean;

  publisher?: {
    name: string;
    location?: string;
    website?: string;
  };
}
