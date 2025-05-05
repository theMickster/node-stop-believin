import { injectable, inject } from 'inversify';
import { Book } from '../../../data/entities/book';
import { BookRepository } from '../../../data/repos/bookRepository';
import { IQueryHandler } from '../../../libs/cqrs/queryHandler';
import TYPES from '../../../libs/ioc.types';
import { ReadBookQuery } from './readBookQuery';

@injectable()
export class ReadBookHandler implements IQueryHandler<ReadBookQuery, Book | null> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(query: ReadBookQuery): Promise<Book | null> {
    return this.bookRepository.getById(query.id);
  }
}
