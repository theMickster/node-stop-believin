import { injectable } from 'inversify';
import winston from 'winston';
import { ILogger } from './logger.interface';
import config from '../../config/config';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

@injectable()
export class WinstonLogger implements ILogger {
  private readonly logger: winston.Logger;
  private readonly staticProps: Record<string, string>;

  constructor() {
    this.staticProps = {
      ApplicationName: config.applicationName,
      ApplicationVersion: config.applicationVersion,
      Environment: config.environment.toUpperCase(),
    };

    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint()),
      transports: [new winston.transports.Console(), new OpenTelemetryTransportV3({format: winston.format.json()})],
    });
  }

  private enrichMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...this.staticProps,
      ...meta,
    };
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.logger.info(message, this.enrichMetadata(meta));
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.logger.warn(message, this.enrichMetadata(meta));
  }

  error(message: string, meta?: Record<string, unknown>) {
    const enrichedMeta = this.enrichMetadata(meta);
    const errorObject = (meta && meta.error instanceof Error) ? meta.error : new Error(message);
    this.logger.error(message, { ...enrichedMeta, error: errorObject });    
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.logger.debug(message, this.enrichMetadata(meta));
  }
}
