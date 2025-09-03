import { Router } from 'express';

import { InfoController } from '@features/info/controllers/info.controller';

import { versionOneRoutes } from './v1';
import { versionTwoRoutes } from './v2';

export function apiRoutes(): Router {
  const router = Router();

  const infoController = new InfoController();

  router.get('/', infoController.getApiInfo.bind(infoController));
  router.use('/v1', versionOneRoutes());
  router.use('/v2', versionTwoRoutes());

  return router;
}
