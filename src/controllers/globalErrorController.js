import AppError from '../utils/AppError.js';

const sendErrorRespDev = function (err, req, res) {
	// A) Dev Api error
	if (req.originalUrl.startsWith('/api')) {
		console.error('Dev Api Error 💥💥');
		// console.log(!err.isOperational ? err : '');
		console.log(err);
		return res.status(err.statusCode || 500).json({
			status: err.status || 'error',
			message: err.message,
			error: err,
			stack: err.stack,
		});
	}

	// B) Dev Website error
	console.error('Dev Website Error 💥💥');
	// console.log(!err.isOperational ? err : '');
	console.log(err);
	return res.status(500).render('error', {
		title: 'Something went wrong...',
		message: err.message,
	});
};

const handleInvalidId = (err) => new AppError(`Tour id: ${err.value} is invalid`, 400);

const handleValidationError = (err) => new AppError(err.message, 400);

const handleDupKeyError = (err) =>
	new AppError(`Field value ${err.message.match(/"(.*?)"/g)} must be unique`, 400);

const handleJWTExpiredError = (err) => new AppError('Token expired, Please login again', 401);

const handleInvalidTokenError = (err) => new AppError('Invalid token, Please login again', 401);

const sendErrorRespProd = function (err, req, res) {
	// A) Prod Operational--
	if (err.isOperational) {
		// i) Api error
		if (req.originalUrl.startsWith('/api'))
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});

		// ii) Website error
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong...',
			message: err.message,
		});
	}
	// B) Prod Non-Operational
	// i) Api error
	console.log('PROD ERROR ⚠️⚠️', err);
	if (req.originalUrl.startsWith('/api'))
		return res.status(500).json({
			status: 'fail',
			message: 'Something went very wrong...',
		});

	// ii) Website error
	return res.status(500).render('error', {
		title: 'Something went wrong...',
		message: 'Internal server error... Please try again in some time.',
	});
};

const globalErrorController = (err, req, res, next) => {
	const nodeEnv = process.env.NODE_ENV || 'dev';
	// console.log('here 💥💥💥💥💥', err.message);
	// console.dir(nodeEnv);
	if (nodeEnv == 'dev') sendErrorRespDev(err, req, res);
	if (nodeEnv == 'prod') {
		let error = err;
		if (err.name == 'CastError') error = handleInvalidId(err);
		if (err.name == 'ValidationError') error = handleValidationError(err);
		if (err.code == 11000) error = handleDupKeyError(err);
		if (err.name == 'TokenExpiredError') error = handleJWTExpiredError(err);
		if (err.name == 'JsonWebTokenError') error = handleInvalidTokenError(err);
		sendErrorRespProd(error, req, res);
	}
};

export default globalErrorController;
