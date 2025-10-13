import { Router } from 'express';
import { versionOneRoutes } from './v1';
import { versionTwoRoutes } from './v2';
import { InfoController } from '@controllers/info.controller';

export function apiRoutes(): Router {
  const router = Router();

  const infoController = new InfoController();

  router.get('/', infoController.getApiInfo.bind(infoController));
  router.use('/v1', versionOneRoutes());
  router.use('/v2', versionTwoRoutes());

  return router;
}
