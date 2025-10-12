import { Router } from 'express';
import { bookRoutes } from './book.routes';

export function v1Routes(): Router {
  const router = Router();

  // Mount all v1 routes
  router.use('/books', bookRoutes());

  return router;
}
