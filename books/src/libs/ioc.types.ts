const TYPES = {
    AppConfig: Symbol.for('AppConfig'),
    WinstonLogger: Symbol.for('WinstonLogger'),
    AppInsightsLogger: Symbol.for('AppInsightsLogger'),    
    Logger: Symbol.for('Logger'),
    BookRepository: Symbol.for("BookRepository"),
    ReadBookListHandler: Symbol.for("ReadBookListHandler"),
    ReadBookHandler: Symbol.for("ReadBookHandler"),
    CreateBookCommandHandler: Symbol.for("CreateBookCommandHandler"),
    BookController: Symbol.for("BookController"),
    CosmosClient: Symbol.for('CosmosClient'),
    BookContainer: Symbol.for('BookContainer'),
    AuthorContainer: Symbol.for('AuthorContainer'),    
    UpdateBookValidator: Symbol.for('UpdateBookValidator'),
    UpdateBookCommandHandler: Symbol.for("UpdateBookCommandHandler"),    
    DeleteBookValidator: Symbol.for('DeleteBookValidator'),
    DeleteBookCommandHandler: Symbol.for("DeleteBookCommandHandler"),
};

export default TYPES;
