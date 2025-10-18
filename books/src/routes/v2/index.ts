import { Router } from 'express';
import { authenticateToken } from '@middleware/authMiddleware';
import { requireAdmin, getCurrentUser } from '@middleware/authorizationMiddleware';
import { AuthController } from '@features/auth/controllers/auth.controller';

export function versionTwoRoutes(): Router {
  const router = Router();
  const authController = new AuthController();
  router.get('/protected', authenticateToken, authController.getProtectedRoute.bind(authController));
  router.get('/me', authenticateToken, getCurrentUser, authController.getCurrentUser.bind(authController));
  router.get('/admin/stats', authenticateToken, requireAdmin, authController.getAdminStats.bind(authController));
  router.get('/test/role-check', authenticateToken, authController.getRoleCheck.bind(authController));

  return router;
}
