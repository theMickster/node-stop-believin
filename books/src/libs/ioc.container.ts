import { Container } from 'inversify';
import TYPES from './ioc.types';
import { BookController } from '../controllers/book.controller';
import { BookRepository } from '../data/repos/bookRepository';
import { ReadBookListQueryHandler } from '../features/book/queries/readBookList.query.handler';
import { ReadBookQueryHandler } from '../features/book/queries/readBook.query.handler';
import { CreateBookCommandHandler } from '../features/book/commands/createBook.command.handler';
import { default as config } from '../config/config';
import { CosmosClient, Container as CosmosContainer } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { DeleteBookValidator } from 'features/book/validators/deleteBook.validator';
import { DeleteBookCommandHandler } from 'features/book/commands/deleteBook.command.handler';

const container = new Container();

container.bind<typeof config>(TYPES.AppConfig).toConstantValue(config);

container
  .bind<CosmosClient>(TYPES.CosmosClient)
  .toDynamicValue((context) => {
    const appConfig = context.get<typeof config>(TYPES.AppConfig);
    if (!appConfig.endpoint) {
      throw new Error('The CosmicBooks Cosmos DB Endpoint is not properly configured.');
    }

    const credential = new DefaultAzureCredential();
    return new CosmosClient({
      endpoint: appConfig.endpoint,
      aadCredentials: credential,
    });
    
}).inSingletonScope();

container
  .bind<CosmosContainer>(TYPES.BookContainer)
  .toDynamicValue((context) => {
    const cosmosClient = context.get<CosmosClient>(TYPES.CosmosClient);
    const appConfig = context.get<typeof config>(TYPES.AppConfig);
    const database = cosmosClient.database(appConfig.databaseId);
    return database.container(appConfig.bookContainerId);
}).inSingletonScope();

container
  .bind<CosmosContainer>(TYPES.AuthorContainer)
  .toDynamicValue((context) => {
    const cosmosClient = context.get<CosmosClient>(TYPES.CosmosClient);
    const appConfig = context.get<typeof config>(TYPES.AppConfig);
    const database = cosmosClient.database(appConfig.databaseId);
    return database.container(appConfig.authorContainerId);
}).inSingletonScope();

// Bind Repositories
container.bind<BookRepository>(TYPES.BookRepository).to(BookRepository);

// Bind Query Handlers
container.bind<ReadBookListQueryHandler>(TYPES.ReadBookListHandler).to(ReadBookListQueryHandler);
container.bind<ReadBookQueryHandler>(TYPES.ReadBookHandler).to(ReadBookQueryHandler);

// Bind Command Handlers
container.bind<CreateBookCommandHandler>(TYPES.CreateBookCommandHandler).to(CreateBookCommandHandler);
container.bind<DeleteBookCommandHandler>(TYPES.DeleteBookCommandHandler).to(DeleteBookCommandHandler);
// Bind Validators
container.bind<DeleteBookValidator>(TYPES.DeleteBookValidator).to(DeleteBookValidator);

// Bind Controllers
container.bind<BookController>(BookController).to(BookController);

export default container;
