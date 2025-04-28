import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import Stripe from 'stripe';
import { createOne, deleteOne, readAll, readOne, updateOne } from './handlerFactory.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const getCheckout = catchAsync(async function (req, res, next) {
	const tour = await Tour.findById(req.params.tourId);
	const params = new URLSearchParams({
		tour: tour.id,
		user: req.currentUser.id,
		price: tour.price,
	});

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		// success_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/`,
		// TEMPORARY SOLUTION
		success_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/?${params.toString()}`,
		// success_url: `${req.protocol}://${req.hostname}:${process.env.PORT}/??tour=${tour.id}&user=${req.currentUser.id}&price=${tour.price}`,

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

	// console.log(session);
	res.status(200).json({ status: 'success', session });
});

export const getPaymentSuccess = catchAsync(async (req, res, next) => {
	// Create a booking if payment is successfull
	const { tour, price, user } = req.query;
	// console.log(req.query);
	if (!tour && !user && !price) return next();

	await Booking.create({ tour, price, user });
	res.redirect(req.originalUrl.split('?')[0]);
	next();
});
export const getPaymentFail = (req, res, enxt) => {
	next(AppError('Payment Failed...'));
};


export const createBooking = createOne(Booking);
export const getAllBookings = readAll(Booking)
export const getBookingById = readOne(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
