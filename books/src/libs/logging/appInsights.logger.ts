import { injectable } from 'inversify';
import appInsights from 'applicationinsights';
import { ILogger } from './logger.interface';
import config from 'config/config';

@injectable()
export class AppInsightsLogger implements ILogger {
  private readonly staticProps: Record<string, string>;

  constructor() {
    const connectionString = config.appInsightsConnectionString;
    if (!connectionString || connectionString === '') {
      throw new Error(
        'The Azure Application Insights Connection String is not set. Please set the connection string in the environment variables or config file.',
      );
    }

    if (!appInsights?.defaultClient) {
      appInsights
        .setup(connectionString)
        .setAutoCollectConsole(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectRequests(true)
        .setAutoCollectExceptions(true)
        .start();
    }

    this.staticProps = {
      ApplicationName: config.applicationName,
      ApplicationVersion: config.applicationVersion,
      Environment: config.environment.toUpperCase(),
    };
  }

  info(message: string, meta: Record<string, unknown> = {}): void {
    appInsights.defaultClient.trackTrace({ message: `[INFO] ${message}`, properties: this.enrichMetadata(meta), severity: 'Information' });
  }
  warn(message: string, meta: Record<string, unknown> = {}): void {
    appInsights.defaultClient.trackTrace({ message: `[WARN] ${message}`, properties: this.enrichMetadata(meta), severity: 'Warning' });
  }
  error(message: string, meta: Record<string, unknown> = {}): void {
    appInsights.defaultClient.trackException({ exception: new Error(message), properties: this.enrichMetadata(meta), severity: 'Error' });
  }
  debug(message: string, meta: Record<string, unknown> = {}): void {
    appInsights.defaultClient.trackTrace({ message: `[DEBUG] ${message}`, properties: this.enrichMetadata(meta), severity: 'Verbose' });
  }

   private enrichMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...this.staticProps,
      ...meta,
    };
  }
}
