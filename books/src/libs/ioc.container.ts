import { Container } from 'inversify';
import TYPES from './ioc.types';
import { default as config } from '../config/config';
import { CosmosClient, Container as CosmosContainer } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { AuthorController } from '@features/author/controllers/author.controller';
import { BookController } from '@features/book/controllers/book.controller';
import { BookPublishController } from '@features/book/controllers/publish/bookPublish.controller';
import { BookClassifyController } from '@features/book/controllers/classify/bookClassify.controller';
import { BookRepository } from '@data/repos/book.repository';
import { AuthorRepository } from '@data/repos/author.repository';
import { CreateAuthorCommandHandler } from '@features/author/commands/createAuthor.command.handler';
import { CreateBookCommandHandler } from '@features/book/commands/createBook.command.handler';
import { DeleteBookCommandHandler } from '@features/book/commands/deleteBook.command.handler';
import { PublishBookCommandHandler } from '@features/book/commands/publishBook.command.handler';
import { UpdatePublicationCommandHandler } from '@features/book/commands/updatePublication.command.handler';
import { ClassifyBookCommandHandler } from '@features/book/commands/classifyBook.command.handler';
import { UpdateClassificationCommandHandler } from '@features/book/commands/updateClassification.command.handler';
import { ReadAuthorQueryHandler } from '@features/author/queries/readAuthor.query.handler';
import { ReadAuthorListQueryHandler } from '@features/author/queries/readAuthorList.query.handler';
import { ReadBookQueryHandler } from '@features/book/queries/readBook.query.handler';
import { ReadBookListQueryHandler } from '@features/book/queries/readBookList.query.handler';
import { DeleteBookValidator } from '@features/book/validators/deleteBook.validator';
import { UpdateBookValidator } from '@features/book/validators/updateBook.validator';
import { UpdateBookCommandHandler } from '@features/book/commands/updateBook.command.handler';
import { ILogger } from './logging/logger.interface';
import { WinstonLogger } from './logging/winston.logger';
import { CosmicLogger } from './logging/cosmic.logger';

const container = new Container();

container.bind<typeof config>(TYPES.AppConfig).toConstantValue(config);
container.bind<ILogger>(TYPES.WinstonLogger).to(WinstonLogger).inSingletonScope();
container.bind<ILogger>(TYPES.Logger).to(CosmicLogger).inSingletonScope();

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
  })
  .inSingletonScope();

container
  .bind<CosmosContainer>(TYPES.BookContainer)
  .toDynamicValue((context) => {
    const cosmosClient = context.get<CosmosClient>(TYPES.CosmosClient);
    const appConfig = context.get<typeof config>(TYPES.AppConfig);
    const database = cosmosClient.database(appConfig.databaseId);
    return database.container(appConfig.bookContainerId);
  })
  .inSingletonScope();

container
  .bind<CosmosContainer>(TYPES.AuthorContainer)
  .toDynamicValue((context) => {
    const cosmosClient = context.get<CosmosClient>(TYPES.CosmosClient);
    const appConfig = context.get<typeof config>(TYPES.AppConfig);
    const database = cosmosClient.database(appConfig.databaseId);
    return database.container(appConfig.authorContainerId);
  })
  .inSingletonScope();

// Bind Repositories
container.bind<BookRepository>(TYPES.BookRepository).to(BookRepository);
container.bind<AuthorRepository>(TYPES.AuthorRepository).to(AuthorRepository);

// Bind Query Handlers
container.bind<ReadAuthorListQueryHandler>(TYPES.ReadAuthorListHandler).to(ReadAuthorListQueryHandler);
container.bind<ReadAuthorQueryHandler>(TYPES.ReadAuthorHandler).to(ReadAuthorQueryHandler);
container.bind<ReadBookListQueryHandler>(TYPES.ReadBookListHandler).to(ReadBookListQueryHandler);
container.bind<ReadBookQueryHandler>(TYPES.ReadBookHandler).to(ReadBookQueryHandler);

// Bind Command Handlers
container.bind<CreateAuthorCommandHandler>(TYPES.CreateAuthorCommandHandler).to(CreateAuthorCommandHandler);
container.bind<CreateBookCommandHandler>(TYPES.CreateBookCommandHandler).to(CreateBookCommandHandler);
container.bind<DeleteBookCommandHandler>(TYPES.DeleteBookCommandHandler).to(DeleteBookCommandHandler);
container.bind<UpdateBookCommandHandler>(TYPES.UpdateBookCommandHandler).to(UpdateBookCommandHandler);
container.bind<PublishBookCommandHandler>(TYPES.PublishBookCommandHandler).to(PublishBookCommandHandler);
container
  .bind<UpdatePublicationCommandHandler>(TYPES.UpdatePublicationCommandHandler)
  .to(UpdatePublicationCommandHandler);
container.bind<ClassifyBookCommandHandler>(TYPES.ClassifyBookCommandHandler).to(ClassifyBookCommandHandler);
container
  .bind<UpdateClassificationCommandHandler>(TYPES.UpdateClassificationCommandHandler)
  .to(UpdateClassificationCommandHandler);

// Bind Validators
container.bind<DeleteBookValidator>(TYPES.DeleteBookValidator).to(DeleteBookValidator);
container.bind<UpdateBookValidator>(TYPES.UpdateBookValidator).to(UpdateBookValidator);

// Bind Controllers
container.bind<AuthorController>(TYPES.AuthorController).to(AuthorController);
container.bind<BookController>(TYPES.BookController).to(BookController);
container.bind<BookPublishController>(TYPES.BookPublishController).to(BookPublishController);
container.bind<BookClassifyController>(TYPES.BookClassifyController).to(BookClassifyController);

export default container;
