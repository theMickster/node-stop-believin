import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { LogOperation } from '@libs/decorators/logging.decorators';
import { Get, RequireRoles } from '@libs/decorators/route.decorators';
import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';

import authConfig from '../../../config/authConfig';

import { HealthService } from '../services/health.service';

@injectable()
export class HealthController {
  constructor(
    @inject(TYPES.HealthService) private readonly healthService: HealthService,
    // @ts-expect-error - Logger is used by @LogOperation decorator via getLoggerFromContext()
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  /**
   * GET /health
   * Comprehensive health check endpoint
   * Requires ADMIN role
   */
  @Get('/')
  @RequireRoles(authConfig.roles.admin)
  @LogOperation('HealthCheck')
  async getHealth(req: Request, res: Response): Promise<void> {
    const healthStatus = await this.healthService.checkHealth();

    const statusCode =
      healthStatus.status === 'healthy'
        ? HttpStatus.OK
        : healthStatus.status === 'degraded'
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json(healthStatus);
  }

  /**
   * GET /health/liveness
   * Simple liveness probe - checks if the application is running
   * Requires ADMIN role
   */
  @Get('/liveness')
  @RequireRoles(authConfig.roles.admin)
  @LogOperation('LivenessCheck')
  async getLiveness(req: Request, res: Response): Promise<void> {
    res.status(HttpStatus.OK).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * GET /health/readiness
   * Readiness probe - checks if the application is ready to serve requests
   * Requires ADMIN role
   */
  @Get('/readiness')
  @RequireRoles(authConfig.roles.admin)
  @LogOperation('ReadinessCheck')
  async getReadiness(req: Request, res: Response): Promise<void> {
    const healthStatus = await this.healthService.checkHealth();

    const isReady = healthStatus.status === 'healthy' || healthStatus.status === 'degraded';
    const statusCode = isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json({
      status: isReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: healthStatus.checks,
    });
  }
}
