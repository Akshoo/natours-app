import AppError from '../utils/AppError.js';

const sendErrorRespDev = function (err, res) {
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message,
        error: err,
        stack: err.stack,
    });
};
const handleInvalidId = (err) =>
    new AppError(`Tour id: ${err.value} is invalid`, 400);

const handleValidationError = (err) => new AppError(err.message, 400);
const handleDupKeyError = (err) =>
    new AppError(
        `Field value ${err.message.match(/"(.*?)"/g)} must be unique`,
        400
    );
const handleJWTExpiredError = (err) =>
    new AppError('Token expired, Please login again', 401);

const handleInvalidTokenError = (err) =>
    new AppError('Invalid token, Please login again', 401);

const sendErrorRespProd = function (err, res) {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.log(err);
        res.status(500).json({
            status: 'fail',
            message: 'Something went very wrong...',
        });
    }
};

const globalErrorController = (err, req, res, next) => {
    const nodeEnv = process.env.NODE_ENV || 'dev';
    // console.log('here 💥💥💥💥💥', err.message);
    // console.dir(nodeEnv);
    if (nodeEnv == 'dev') sendErrorRespDev(err, res);
    if (nodeEnv == 'prod') {
        let error = err;
        if (err.name == 'CastError') error = handleInvalidId(err);
        if (err.name == 'ValidationError') error = handleValidationError(err);
        if (err.code == 11000) error = handleDupKeyError(err);
        if (err.name == 'TokenExpiredError') error = handleJWTExpiredError(err);
        if (err.name == 'JsonWebTokenError')
            error = handleInvalidTokenError(err);
        sendErrorRespProd(error, res);
    }
};

export default globalErrorController;
