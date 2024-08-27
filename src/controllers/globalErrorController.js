const sendErrorRespDev = function (err, res) {
    res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

const sendErrorRespProd = function (err, res) {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'fail',
            message: `Tour id: ${err.value} is invalid`,
        });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
    if (err.code == 11000) {
        return res.status(400).json({
            status: 'fail',
            message: `Field value ${err.message.match(
                /"(.*?)"/g
            )} must be unique`,
        });
    }
    res.status(500).json({
        status: 'fail',
        message: 'Something went very wrong...',
    });
};

const globalErrorController = (err, req, res, next) => {
    const nodeEnv = process.env.NODE_ENV || 'dev';
    // console.log('here 💥💥💥💥💥', err);
    // console.dir(nodeEnv);
    if (nodeEnv == 'dev') sendErrorRespDev(err, res);
    if (nodeEnv == 'prod') sendErrorRespProd(err, res);
};

export default globalErrorController;
