import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import iocContainer from '../libs/ioc.container';
import TYPES from '@libs/ioc.types';

export function bookRoutes(): Router {
  const router = Router();

  const controller = iocContainer.get<BookController>(TYPES.BookController);

  router.get('/', controller.getBooks.bind(controller));
  router.get('/:id', controller.getBookById.bind(controller));
  router.post('/', controller.createBook.bind(controller));
  router.put('/:id', controller.updateBook.bind(controller));
  router.delete('/:id', controller.deleteBook.bind(controller));

  return router;
}
