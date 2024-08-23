const globalErrorController = (err, req, res, next) => {
    // console.log(err);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        // error: err,
    });
};

export default globalErrorController;
