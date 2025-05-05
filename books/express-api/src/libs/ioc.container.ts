import { Container } from 'inversify';
import TYPES from './ioc.types';
import { BookController } from '../controllers/bookController';
import { BookRepository } from '../data/repos/bookRepository';
import { ReadBookListHandler } from '../features/book/queries/readBookListHandler';
import { ReadBookHandler } from '../features/book/queries/readBookQueryHander';
import { CreateBookCommandHandler } from '../features/book/commands/createBookCommandHandler';
import { default as config } from '../config/config';
import { CosmosClient, Container as CosmosContainer } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

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
container.bind<ReadBookListHandler>(TYPES.ReadBookListHandler).to(ReadBookListHandler);
container.bind<ReadBookHandler>(TYPES.ReadBookHandler).to(ReadBookHandler);

// Bind Command Handlers
container.bind<CreateBookCommandHandler>(TYPES.CreateBookCommandHandler).to(CreateBookCommandHandler);

// Bind Controllers
container.bind<BookController>(BookController).to(BookController);

export default container;
