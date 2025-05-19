import { inject, injectable } from 'inversify';
import { ILogger } from './logger.interface';
import TYPES from '../ioc.types';

@injectable()
export class CosmicLogger implements ILogger {
  constructor(
    @inject(TYPES.WinstonLogger) private readonly winstonLogger: ILogger,
    @inject(TYPES.AppInsightsLogger) private readonly appInsightsLogger: ILogger
  ) {}

  info(message: string, meta?: Record<string, unknown>) {
    this.winstonLogger.info(message, meta);
    this.appInsightsLogger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.winstonLogger.warn(message, meta);
    this.appInsightsLogger.warn(message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.winstonLogger.error(message, meta);
    this.appInsightsLogger.error(message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.winstonLogger.debug(message, meta);
    this.appInsightsLogger.debug(message, meta);
  }
}
