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
    tenantId: process.env.AZURE_TENANT_ID ?? '',
    endpoint: process.env.COSMOS_DB_ENDPOINT ?? '',
    databaseId: process.env.COSMOS_DB_DATABASE_ID ?? '',
    containerId: process.env.COSMOS_DB_CONTAINER_ID ?? '',
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV ?? 'development'
};

export default config;