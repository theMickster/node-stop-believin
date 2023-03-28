import express from 'express';
import router from './home';

export const routes = express.Router();

routes.use(router);