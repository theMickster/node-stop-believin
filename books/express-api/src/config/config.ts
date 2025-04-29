import dotenv from 'dotenv';

dotenv.config();

interface Config {
    tenantId: string;
    endpoint: string | undefined;
    databaseId: string;
    containerId: string;
    nodeEnv: string;
    port: number
}

const config: Config = {
    tenantId: process.env.ShawskyTenantId ?? '',
    endpoint: process.env.CosmicReadsEndpoint ?? '',
    databaseId: process.env.CosmicReadsDatabase ?? '',
    containerId: process.env.CosmicReadsBookContainer ?? '',
    port: Number(process.env.PORT) || 3898,
    nodeEnv: process.env.NODE_ENV ?? 'development'
};

export default config;