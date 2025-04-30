import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async function (req, res, next) {
	const tours = await Tour.find();

	res.status(200).render('overview', {
		title: 'All Tours',
		tours,
	});
});

export const getTourDetails = catchAsync(async function (req, res, next) {
	const { slug } = req.params;
	const tour = await Tour.findOne({ slug }).populate({
		path: 'reviews',
		fields: 'user rating description',
	});
	if (!tour) return next(new AppError(`Tour of that name wasn't found`, 400));

	res.status(200).render('tourDetails', {
		title: tour.name,
		tour,
	});
});

export const getSignup = catchAsync(async function (req, res, next) {
	res.status(200).render('signup', {
		title: 'Signup to Natours',
	});
});

export const getLogin = catchAsync(async function (req, res) {
	res.status(200).render('login', {
		title: 'Login to Natours',
	});
});

export const getMe = function (req, res, next) {
	res.status(200).render('account', {
		title: 'Account',
	});
};

export const updateUserDetails = catchAsync(async function (req, res, next) {
	const updatedUser = await User.findByIdAndUpdate(
		req.currentUser.id,
		{
			name: req.body.name,
			email: req.body.email,
		},
		{
			new: true,
			runValidators: true,
		}
	);

	res.status(200).render('account', {
		title: 'Account',
		user: updatedUser,
	});
});

export const getMyBookings = catchAsync(async function (req, res, next) {
	const user = req.currentUser;
	const userBookings = await Booking.find().distinct('tour');
	const tours = await Tour.find({ _id: { $in: userBookings } });

	// if (tours.length == 0) throw new AppError('You havent booked any tour...', 404);

	res.status(200).render('overview', { tours });
});
