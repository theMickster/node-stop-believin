import { ISBN } from '@data/entities/book.entity';

export interface PublishBookDto {
  isbn: ISBN;
  publishedDate?: Date;
  copyright?: string;
  firstPublishedDate?: Date;
  edition?: string;
  bisacCodes?: string[];
  thema?: string[];
}
