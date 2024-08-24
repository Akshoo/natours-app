const sendErrorRespDev = function (err, res) {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

const sendErrorRespProd = function (err, res) {
    if (!err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        res.status(err.statusCode).json({
            status: 'fail',
            message: 'Something went very wrong...',
        });
    }
};

const globalErrorController = (err, req, res, next) => {
    const nodeEnv = process.env.NODE_ENV || 'dev';
    console.log('here 💥💥💥💥💥', err);
    console.dir(nodeEnv);
    if (nodeEnv == 'dev') sendErrorRespDev(err, res);
    if (nodeEnv == 'prod') sendErrorRespProd(err, res);
};

export default globalErrorController;
