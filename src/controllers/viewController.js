import Tour from '../models/tourModel.js';
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

    res.status(200).render('tourDetails', {
        title: tour.name,
        tour,
    });
});

export const getLogin = catchAsync(async function (req, res) {
    res.status(200).render('login', {
        title: 'Login to Natours',
    });
});
