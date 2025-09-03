import bodyParser from 'body-parser';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './docs/swagger';
import container from './libs/ioc.container';
import TYPES from './libs/ioc.types';
import { ILogger } from './libs/logging/logger.interface';
import { setGlobalLogger } from './libs/logging/loggerAccessor';
import { initializeTelemetry } from './libs/logging/telemetry';
import passport from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { requestContextMiddleware } from './middleware/requestContext';
import { createRequestLoggingMiddleware } from './middleware/requestLogging';
import { apiRoutes } from './routes';

initializeTelemetry();

const app = express();

// Get logger from IOC container & enitialize global logger for decorator access
const logger = container.get<ILogger>(TYPES.Logger);
setGlobalLogger(logger);

// IMPORTANT: Request context middleware MUST come BEFORE authentication
// This ensures correlation IDs are available even for authentication failures
app.use(requestContextMiddleware);

app.use(passport.initialize());

// Request logging middleware - logs incoming requests and completions
// Placed after authentication so user context is captured when available
app.use(createRequestLoggingMiddleware(logger));

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Cosmic Books API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  }),
);

app.use('/api', apiRoutes());

app.use(errorHandler);

export default app;
