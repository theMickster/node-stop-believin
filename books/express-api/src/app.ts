import express from 'express';
import { bookRoutes } from './routes/book.route';
import { errorHandler } from './middleware/errorHandler';
import bodyParser from 'body-parser';

const app = express();


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/books', bookRoutes());

app.use(errorHandler);

export default app;