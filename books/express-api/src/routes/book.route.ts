import { Router } from 'express';
import { Container } from '@azure/cosmos';
import { BookRepository } from '../data/bookRepository';
import { BookController } from '../controllers/bookController';

export function bookRoutes(container: Container): Router {
  const router = Router();
  const repo = new BookRepository(container);
  const controller = new BookController(repo);

  router.get('/', controller.getBooks.bind(controller));
  router.get('/:id', controller.getBookById.bind(controller));

  return router;
}