import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';

import AppError from './utils/AppError.js';
import globalErrorController from './controllers/globalErrorController.js';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import viewRouter from './routes/viewRoutes.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = '/api/v1';
const limiter = rateLimit({
    windowMs: 1 * 60 * 60 * 1000, // 1 hour
    limit: 100,
    message: {
        status: 'fail',
        message: 'Too many requests, try again after an hour...',
    },
});

const app = express();

// GLOBAL MIDDLEWARES
app.use(express.json({ limit: '10kb' }));
app.use(ExpressMongoSanitize());
app.use(xss());
app.use(morgan('dev'));
app.use(express.static(`${__dirname}/../public`));
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);
// app.use(helmet());
app.use(cookieParser());
app.use(`${BASE_URL}`, limiter);

// ROUTES
app.use(`${BASE_URL}/tours`, tourRouter);
app.use(`${BASE_URL}/users`, userRouter);
app.use(`${BASE_URL}/reviews`, reviewRouter);
app.use('/', viewRouter);

// Handling ALL unhandled Routes
app.all('*', (req, res, next) => {
    const err = new AppError(`Cannot find ${req.url} on the server.`, 404);
    next(err);
});

app.use(globalErrorController);

export default app;
