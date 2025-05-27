import { AzureMonitorOpenTelemetryOptions, useAzureMonitor } from '@azure/monitor-opentelemetry';
import config from '../../config/config';

const connectionString = config.appInsightsConnectionString;
if (!connectionString || connectionString === '') {
  throw new Error(
    'The Azure Application Insights Connection String is not set. Please set the connection string in the environment variables or config file.',
  );
}

const options: AzureMonitorOpenTelemetryOptions = {
  azureMonitorExporterOptions: {
    connectionString: connectionString,
  },
  enableLiveMetrics: true,
  enableStandardMetrics: true,
  instrumentationOptions: {
    azureSdk: { enabled: true },
    http: { enabled: true },
    winston: { enabled: true }
  },
};

useAzureMonitor(options);
