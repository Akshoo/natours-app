import express from 'express';
import morgan from 'morgan';

import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = '/api/v1';

// MIDDLEWARES
const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(`${__dirname}/../public`));

// ROUTES
app.use(`${BASE_URL}/tours`, tourRouter);
app.use(`${BASE_URL}/users`, userRouter);

export default app;
