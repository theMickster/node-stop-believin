import { Router } from 'express';
import { authorRoutes } from '@features/author/routes/author.routes';
import { bookRoutes } from '@features/book/routes/book.routes';

export function versionOneRoutes(): Router {
  const router = Router();
  router.use('/authors', authorRoutes());
  router.use('/books', bookRoutes());

  return router;
}
