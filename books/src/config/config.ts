import dotenv from 'dotenv';

dotenv.config();

interface Config {
    tenantId: string;
    endpoint: string | undefined;
    databaseId: string;
    authorContainerId: string;
    bookContainerId: string;
    nodeEnv: string;
    port: number
}

const config: Config = {
    tenantId: process.env.ShawskyTenantId ?? '',
    endpoint: process.env.CosmicReadsEndpoint ?? '',
    databaseId: process.env.CosmicReadsDatabase ?? '',
    authorContainerId: process.env.CosmicReadsAuthorContainer ?? '',
    bookContainerId: process.env.CosmicReadsBookContainer ?? '',
    port: Number(process.env.PORT) || 3898,
    nodeEnv: process.env.NODE_ENV ?? 'development'
};

export default config;