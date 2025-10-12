import { Router } from 'express';
import { v1Routes } from './v1';
import { v2Routes } from './v2';

export function apiRoutes(): Router {
  const router = Router();

  // Mount versioned routes
  router.use('/v1', v1Routes());
  router.use('/v2', v2Routes());

  // Optional: Root endpoint showing available versions
  router.get('/', (req, res) => {
    res.status(200).json({
      message: 'Cosmic Books API',
      versions: {
        v1: '/api/v1',
        v2: '/api/v2'
      },
      documentation: 'See README for API documentation'
    });
  });

  return router;
}
