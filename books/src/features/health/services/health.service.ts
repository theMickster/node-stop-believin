import { Container as CosmosContainer } from '@azure/cosmos';
import { inject, injectable } from 'inversify';

import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';

import config from '../../../config/config';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    cosmosDb: ComponentHealth;
    booksContainer: ComponentHealth;
    authorsContainer: ComponentHealth;
    applicationInsights: ComponentHealth;
  };
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  message?: string;
  error?: string;
}

@injectable()
export class HealthService {
  constructor(
    @inject(TYPES.BookContainer) private readonly bookContainer: CosmosContainer,
    @inject(TYPES.AuthorContainer) private readonly authorContainer: CosmosContainer,
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  async checkHealth(): Promise<HealthStatus> {
    this.logger.info('Performing health check');

    const [cosmosDbHealth, booksHealth, authorsHealth, appInsightsHealth] = await Promise.all([
      this.checkCosmosDbConnection(),
      this.checkBooksContainer(),
      this.checkAuthorsContainer(),
      this.checkApplicationInsights(),
    ]);

    // Determine overall status
    const allChecks = [cosmosDbHealth, booksHealth, authorsHealth, appInsightsHealth];
    const overallStatus = this.determineOverallStatus(allChecks);

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: config.applicationVersion,
      environment: config.nodeEnv,
      checks: {
        cosmosDb: cosmosDbHealth,
        booksContainer: booksHealth,
        authorsContainer: authorsHealth,
        applicationInsights: appInsightsHealth,
      },
    };

    this.logger.info('Health check completed', {
      status: overallStatus,
      checks: healthStatus.checks,
    });

    return healthStatus;
  }

  private async checkCosmosDbConnection(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      // Simple database connectivity check
      await this.bookContainer.database.client.getDatabaseAccount();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        message: 'Cosmos DB connection successful',
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Cosmos DB health check failed', { error });

      return {
        status: 'unhealthy',
        responseTime,
        message: 'Cosmos DB connection failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async checkBooksContainer(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      // Check if we can read from the container (count query is lightweight)
      const query = 'SELECT VALUE COUNT(1) FROM c';
      const { resources } = await this.bookContainer.items.query(query).fetchAll();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        message: `Books container accessible (${resources[0]} items)`,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Books container health check failed', { error });

      return {
        status: 'unhealthy',
        responseTime,
        message: 'Books container check failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async checkAuthorsContainer(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      // Check if we can read from the container (count query is lightweight)
      const query = 'SELECT VALUE COUNT(1) FROM c';
      const { resources } = await this.authorContainer.items.query(query).fetchAll();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        message: `Authors container accessible (${resources[0]} items)`,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Authors container health check failed', { error });

      return {
        status: 'unhealthy',
        responseTime,
        message: 'Authors container check failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async checkApplicationInsights(): Promise<ComponentHealth> {
    try {
      // Check if Application Insights is configured
      const connectionString = config.appInsightsConnectionString;

      if (!connectionString || connectionString === '') {
        return {
          status: 'degraded',
          message: 'Application Insights not configured',
        };
      }

      return {
        status: 'healthy',
        message: 'Application Insights configured',
      };
    } catch (error) {
      this.logger.error('Application Insights health check failed', { error });

      return {
        status: 'unhealthy',
        message: 'Application Insights check failed',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private determineOverallStatus(checks: ComponentHealth[]): 'healthy' | 'degraded' | 'unhealthy' {
    const hasUnhealthy = checks.some((check) => check.status === 'unhealthy');
    const hasDegraded = checks.some((check) => check.status === 'degraded');

    if (hasUnhealthy) {
      return 'unhealthy';
    }
    if (hasDegraded) {
      return 'degraded';
    }
    return 'healthy';
  }
}
