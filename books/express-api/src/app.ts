import express from 'express';
import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { bookRoutes } from './routes/book.route';
import config from './config/config';

const credential = new DefaultAzureCredential();
const { endpoint, databaseId, containerId } = config;
const client = new CosmosClient({
  endpoint,
  aadCredentials: credential
});
const database = client.database(databaseId);
const container = database.container(containerId);

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/books', bookRoutes(container));


app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});