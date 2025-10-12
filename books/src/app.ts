import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import bodyParser from 'body-parser';
import { initializeTelemetry } from './libs/logging/telemetry';
import { swaggerSpec } from './config/swagger';

initializeTelemetry();

const app = express();

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Cosmic Books API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Mount versioned API routes
app.use('/api', apiRoutes());

app.use(errorHandler);

export default app;