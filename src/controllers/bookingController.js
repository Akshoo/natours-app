import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import Stripe from 'stripe';
import { createOne, deleteOne, readAll, readOne, updateOne } from './handlerFactory.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const getCheckout = catchAsync(async function (req, res, next) {
	const tour = await Tour.findById(req.params.tourId);
	// const params = new URLSearchParams({
	// 	tour: tour.id,
	// 	user: req.currentUser.id,
	// 	price: tour.price,
	// });

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		// success_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/`,
		// TEMPORARY SOLUTION
		// success_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/?${params.toString()}`,
		// success_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/myBookings`,
		success_url: `${req.protocol}://${req.hostname}/myBookings`,
		cancel_url: `${req.protocol}://${req.hostname}/tour/${tour.slug}`,
		// cancel_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/tour/${tour.slug}`,
		// success_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/??tour=${tour.id}&user=${req.currentUser.id}&price=${tour.price}`,

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
						images: [`${req.protocol}://${req.hostname}/img/tours${tour.imageCover}`],
					},
				},
				quantity: 1,
			},
		],
	});

	// console.log(session);
	res.status(200).json({ status: 'success', session });
});

// export const getPaymentSuccess = catchAsync(async (req, res, next) => {
// 	// Create a booking if payment is successfull
// 	const { tour, price, user } = req.query;
// 	// console.log(req.query);
// 	if (!tour && !user && !price) return next();

// 	await Booking.create({ tour, price, user });
// 	res.redirect(req.originalUrl.split('?')[0]);
// 	next();
// });
const handlePaymentSuccess = catchAsync(async (session) => {
	// Create a booking if payment is successfull
	const tour = session.client_reference_id;
    const user = (await User.find({ email: session.customer_details.email })).id;
    const price = session.amount_total / 100;
	// console.log(req.query);
	if (!tour && !user && !price) return next();

	await Booking.create({ tour, price, user });
});
export const getPaymentFail = (req, res, enxt) => {
	next(AppError('Payment Failed...'));
};

export const handleWebhook = catchAsync(async function (req, res, next) {
	const endpointSecret = process.env.WEBHOOK_SECRET_KEY;
	const signature = req.headers['stripe-signature'];
	let event = req.body;
	try {
		event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
	} catch (err) {
		console.log(`⚠️  Webhook signature verification failed.`, err.message);
		return res.status(400).json({
			status: 'fail',
			request: req.body,
            message: err.message,
		});
	}

	res.status(200).json({ recieved: true });

    if(event.type == 'checkout.session.completed'){
        handlePaymentSuccess(event.data.object);
    }

});

export const createBooking = createOne(Booking);
export const getAllBookings = readAll(Booking);
export const getBookingById = readOne(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
