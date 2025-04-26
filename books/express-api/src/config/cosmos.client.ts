import { Container, CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import config from './config';

function initializeCosmosClient(): Container {
  try {
    const credential = new DefaultAzureCredential();
    const { endpoint, databaseId, containerId } = config;

    const client = new CosmosClient({
      endpoint,
      aadCredentials: credential,
    });

    const database = client.database(databaseId);
    const container = database.container(containerId);

    return container;
  } catch (error) {
    console.error('Error initializing Cosmos DB client:', error);
    throw error;
  }
}

export default initializeCosmosClient;
