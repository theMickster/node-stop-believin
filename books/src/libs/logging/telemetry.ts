import { AzureMonitorOpenTelemetryOptions, useAzureMonitor } from '@azure/monitor-opentelemetry';
import { metrics, ProxyTracerProvider, trace } from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVER_ADDRESS, ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

import config from '../../config/config';

export function initializeTelemetry(): void {
  const connectionString = config.appInsightsConnectionString;
  if (!connectionString || connectionString === '') {
    throw new Error(
      'The Azure Application Insights Connection String is not set. Please set the connection string in the environment variables or config file.',
    );
  }
    
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.applicationName,
    [ATTR_SERVICE_VERSION]: config.applicationVersion,
    environment: config.nodeEnv,
    [ATTR_SERVER_ADDRESS]: config.serverName,
    WEB_SERVER_NAME: 'testValue'
  });

  const options: AzureMonitorOpenTelemetryOptions = {
    azureMonitorExporterOptions: {
      connectionString: connectionString,
    },
    enableLiveMetrics: true,
    enableStandardMetrics: true,
    instrumentationOptions: {
      azureSdk: { enabled: true },
      http: { enabled: true },
      winston: { enabled: true },
    },
    resource: resource,
  };

  useAzureMonitor(options);

  const tracerProvider = (trace.getTracerProvider() as ProxyTracerProvider).getDelegate();
  const meterProvider = metrics.getMeterProvider();

  registerInstrumentations({
    instrumentations: [new ExpressInstrumentation(), new WinstonInstrumentation()],
    tracerProvider: tracerProvider,
    meterProvider: meterProvider,
  });
}
