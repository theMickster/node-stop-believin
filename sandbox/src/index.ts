import express from 'express';
import { Application } from 'express';
import dotenv from 'dotenv';
import { routes } from './routes';
import bodyParser from 'body-parser';
import morgan from 'morgan';


const app: Application = express();

app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// adding morgan to log HTTP requests
app.use(morgan('combined'));

dotenv.config();

// routes
app.use('/', routes);

app.listen(3000);