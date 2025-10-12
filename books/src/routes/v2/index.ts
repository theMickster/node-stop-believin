import { Router } from 'express';

export function v2Routes(): Router {
  const router = Router();

  // Placeholder for v2 routes - to be implemented
  router.get('/', (req, res) => {
    res.status(200).json({
      message: 'API v2 - Coming soon',
      availableVersions: ['v1', 'v2'],
    });
  });

  return router;
}
