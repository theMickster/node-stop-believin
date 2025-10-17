import { Router } from 'express';
import { bookRoutes } from './book.routes';

export function versionOneRoutes(): Router {
  const router = Router();
  router.use('/books', bookRoutes());

  return router;
}
