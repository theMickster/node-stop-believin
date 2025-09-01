import { IQuery } from './query';
import { QueryResult } from './queryResult';

export interface IQueryHandler<TQuery extends IQuery, TResult> {
  handle(query: TQuery): Promise<QueryResult<TResult>>;
}