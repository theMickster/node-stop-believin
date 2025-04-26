import express from 'express';
import { bookRoutes } from './routes/book.route';
import { errorHandler } from './middleware/errorHandler';
import initializeCosmosClient from './config/cosmos.client';

const app = express();
let container: any;

container = initializeCosmosClient();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/books', bookRoutes(container));

app.use(errorHandler);

export default app;