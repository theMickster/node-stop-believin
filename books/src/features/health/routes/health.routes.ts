import { Router } from 'express';

import { buildRoutes } from '@libs/decorators/routeBuilder';
import iocContainer from '@libs/ioc.container';
import TYPES from '@libs/ioc.types';

import { HealthController } from '../controllers/health.controller';

/**
 * @swagger
 * /v1/health:
 *   get:
 *     tags:
 *       - Health (v1)
 *     summary: Comprehensive health check
 *     description: Check the health status of all system components including Cosmos DB and Application Insights (ADMIN only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - ADMIN role required
 *       503:
 *         description: Service unavailable - System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */

/**
 * @swagger
 * /v1/health/liveness:
 *   get:
 *     tags:
 *       - Health (v1)
 *     summary: Liveness probe
 *     description: Simple check to verify the application is running (ADMIN only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Application is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: alive
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - ADMIN role required
 */

/**
 * @swagger
 * /v1/health/readiness:
 *   get:
 *     tags:
 *       - Health (v1)
 *     summary: Readiness probe
 *     description: Check if the application is ready to serve requests (ADMIN only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Application is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 checks:
 *                   type: object
 *                   properties:
 *                     cosmosDb:
 *                       $ref: '#/components/schemas/ComponentHealth'
 *                     booksContainer:
 *                       $ref: '#/components/schemas/ComponentHealth'
 *                     authorsContainer:
 *                       $ref: '#/components/schemas/ComponentHealth'
 *                     applicationInsights:
 *                       $ref: '#/components/schemas/ComponentHealth'
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - ADMIN role required
 *       503:
 *         description: Service unavailable - System is not ready
 */

export function healthRoutes(): Router {
  const controller = iocContainer.get<HealthController>(TYPES.HealthController);
  return buildRoutes(controller);
}
