import APIFeatures from '../utils/APIFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import Tour from './../models/tourModel.js';

export const topCheapAlias = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,ratingsAverage';
    req.query.fields = 'name,ratings,difficulty,summary,duration,price';

    next();
};

export const getAllTours = catchAsync(async function (req, res) {
    // Executing Query

    const tours = await new APIFeatures(req.query, Tour.find())
        .filter()
        .sort()
        .limit()
        .paginate().query;

    console.log('hehehehehehe');
    // Sending Response
    res.json({
        status: 'success',
        results: tours.length,
        data: { tours },
    });
});

export const getTour = catchAsync(async function (req, res, next) {
    // console.log(req.params.id);

    const tour = await Tour.findById(req.params.id);
    console.log('tour found _______________________');

    if (!tour) return next(new AppError('The requested tour not found', 404));

    res.json({
        status: 'success',
        data: tour,
    });
});

export const postTour = catchAsync(async function (req, res) {
    const tour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: tour,
    });
});

export const updateTour = catchAsync(async function (req, res, next) {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!tour) {
        return next(new AppError('The requested tour not found', 404));
    }
    res.json({
        status: 'success',
        data: {
            tour,
        },
    });
});

export const deleteTour = catchAsync(async function (req, res, next) {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) return next(new AppError('The requested tour not found', 404));

    res.status(204).json({
        status: 'success',
        message: 'tour deleted',
    });
});

export const getStats = catchAsync(async function (req, res) {
    const stats = await Tour.aggregate([
        {
            $match: { price: { $lte: 3000 } },
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $count: {} },
                numRatings: {
                    $sum: '$ratingsQuantity',
                },
                avgRatings: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
    ]);

    res.status(200).json({
        status: 'success',
        results: stats.length,
        data: {
            stats,
        },
    });
});

export const getPlan = catchAsync(async function (req, res) {
    const year = +req.params.year;
    // console.log(req.params);
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}`),
                    $lt: new Date(`${year + 1}`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTours: { $sum: 1 },
                tours: {
                    $push: {
                        _id: '$_id',
                        name: '$name',
                    },
                },
                // tours: { $push: '$$ROOT' },
            },
        },
        {
            $addFields: {
                month: '$_id',
            },
        },
        {
            $sort: { numTours: -1 },
        },
        {
            $limit: 12,
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        results: plan.length,
        data: {
            plan,
        },
    });
});
