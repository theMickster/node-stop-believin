const TYPES = {
    BookRepository: Symbol.for("BookRepository"),
    ReadBookListHandler: Symbol.for("ReadBookListHandler"),
    ReadBookHandler: Symbol.for("ReadBookHandler"),
    CreateBookCommandHandler: Symbol.for("CreateBookCommandHandler"),
    BookController: Symbol.for("BookController"),
};

export default TYPES;
