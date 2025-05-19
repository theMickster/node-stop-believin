import dotenv from 'dotenv';

dotenv.config();

interface Config {
    applicationName: string;
    applicationVersion: string;
    tenantId: string;
    endpoint: string | undefined;
    databaseId: string;
    authorContainerId: string;
    bookContainerId: string;
    nodeEnv: string;
    port: number;
    appInsightsConnectionString: string;
    environment: string;
}

const config: Config = {
    applicationName: 'CosmicBooks',
    applicationVersion: '1.0.0',
    tenantId: process.env.ShawskyTenantId ?? '',
    endpoint: process.env.CosmicReadsEndpoint ?? '',
    databaseId: process.env.CosmicReadsDatabase ?? '',
    authorContainerId: process.env.CosmicReadsAuthorContainer ?? '',
    bookContainerId: process.env.CosmicReadsBookContainer ?? '',
    port: Number(process.env.PORT) || 3898,
    nodeEnv: process.env.NODE_ENV ?? 'development',
    appInsightsConnectionString: process.env.ShawskyApplicationInsights ?? '',
    environment: process.env.NODE_ENV ?? 'development',
};

export default config;