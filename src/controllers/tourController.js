import APIFeatures from '../utils/APIFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import Tour from '../models/tourModel.js';
import { readAll, readOne, deleteOne, updateOne, createOne } from './handlerFactory.js';

export const topCheapAlias = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,ratingsAverage';
    req.query.fields = 'name,ratings,difficulty,summary,duration,price';

    next();
};

export const getAllTours = readAll(Tour);
export const getTourById = readOne(Tour, {
    path: 'reviews',
    select: 'name description -tour',
});
export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);

// Aggregation pipeline controller functions
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
