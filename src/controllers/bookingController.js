import Tour from '../models/tourModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const getCheckout = catchAsync(async function (req, res, next) {
	const tour = await Tour.findById(req.params.tourId);

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		success_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/`,
		cancel_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/tour/${tour.slug}`,
		customer_email: req.currentUser.email,
		client_reference_id: req.params.tourId,
		line_items: [
			{
				price_data: {
					unit_amount: +tour.price * 100,
					currency: 'usd',
					product_data: {
						name: `${tour.name} Tour`,
						description: tour.summary,
						images: [`https://natours.dev/img/tours${tour.imageCover}`],
					},
				},
				quantity: 1,
			},
		],
	});

	console.log(session);
	res.status(200).json({ status:'success', session });
});

export const getPaymentSuccess = (req, res, enxt) => {
	res.status(200).json({
		status: 'success',
		message: 'Payment successful!!',
	});
};
export const getPaymentFail = (req, res, enxt) => {
	throw new AppError('Payment Failed...');
	next();
};
