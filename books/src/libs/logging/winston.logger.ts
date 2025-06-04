import { injectable } from 'inversify';
import winston from 'winston';
import { ILogger } from './logger.interface';
import config from '../../config/config';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import path from 'path';

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

    const transports: winston.transport[] = [];

    if (config.environment === 'development') {
      transports.push(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }));      
      transports.push(new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'app.log'),
        level: config.logLevel,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }));
    } 

    transports.push(new OpenTelemetryTransportV3({ format: winston.format.json() }));

    this.logger = winston.createLogger({
      level: config.logLevel,
      format: winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint()),
      transports: transports,
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
