import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import AppError from './utils/AppError.js';
import globalErrorController from './controllers/globalErrorController.js';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = '/api/v1';
const limiter = rateLimit({
    windowMs: 1 * 60 * 60 * 1000,
    limit: 100,
    message: {
        status: 'fail',
        message: 'Too many requestsm, try again after an hour...',
    },
});

const app = express();

// MIDDLEWARES
app.use(express.json({ limit: '10kb' }));
app.use(ExpressMongoSanitize());
app.use(xss());
app.use(morgan('dev'));
app.use(express.static(`${__dirname}/../public`));
app.use(helmet());

// ROUTES
app.use(`${BASE_URL}`, limiter);
app.use(`${BASE_URL}/tours`, tourRouter);
app.use(`${BASE_URL}/users`, userRouter);

// Handling ALL unhandled Routes
app.all('*', (req, res, next) => {
    const err = new AppError(`Cannot find ${req.url} on the server.`, 404);
    next(err);
});

app.use(globalErrorController);

export default app;
