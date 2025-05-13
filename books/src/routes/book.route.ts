import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import iocContainer from '../libs/ioc.container';

export function bookRoutes(): Router {
  const router = Router();

  const controller = iocContainer.get<BookController>(BookController);

  router.get('/', controller.getBooks.bind(controller));
  router.get('/:id', controller.getBookById.bind(controller));
  router.post('/', controller.createBook.bind(controller));
  //router.put('/:id', controller.updateBook.bind(controller));
  //router.delete('/:id', controller.deleteBook.bind(controller));

  return router;
}