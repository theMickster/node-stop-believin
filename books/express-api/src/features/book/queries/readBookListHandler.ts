import { injectable, inject } from 'inversify';
import { Book } from '../../../data/entities/book';
import { BookRepository } from '../../../data/repos/bookRepository';
import { IQueryHandler } from '../../../libs/cqrs/queryHandler';
import TYPES from '../../../libs/ioc.types';
import { ReadBookListQuery } from './readBookListQuery';

@injectable()
export class ReadBookListHandler implements IQueryHandler<ReadBookListQuery, Book[]> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(query: ReadBookListQuery): Promise<Book[]> {
    return this.bookRepository.getAll();
  }
}
