import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { BookPublishController } from '../controllers/bookPublish.controller';
import { BookClassifyController } from '../controllers/bookClassify.controller';
import iocContainer from '../libs/ioc.container';
import TYPES from '@libs/ioc.types';

export function bookRoutes(): Router {
  const router = Router();

  const controller = iocContainer.get<BookController>(TYPES.BookController);
  const publishController = iocContainer.get<BookPublishController>(TYPES.BookPublishController);
  const classifyController = iocContainer.get<BookClassifyController>(TYPES.BookClassifyController);

  router.get('/', controller.getBooks.bind(controller));
  router.get('/:id', controller.getBookById.bind(controller));
  router.post('/', controller.createBook.bind(controller));
  router.put('/:id', controller.updateBook.bind(controller));
  router.delete('/:id', controller.deleteBook.bind(controller));

  router.post('/:id/publish', publishController.publishBook.bind(publishController));
  router.patch('/:id/publication', publishController.updatePublication.bind(publishController));

  router.post('/:id/classify', classifyController.classifyBook.bind(classifyController));
  router.put('/:id/classify', classifyController.updateClassification.bind(classifyController));

  return router;
}
