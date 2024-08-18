import APIFeatures from '../utils/APIFeatures.js';
import Tour from './../models/tourModel.js';

export const topCheapAlias = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,ratingsAverage';
    req.query.fields =
        'name,ratings,difficulty,summary,duration,price';

    next();
};

export const getAllTours = async (req, res) => {
    try {
        // Executing Query

        const tours = await new APIFeatures(
            req.query,
            Tour.find()
        )
            .filter()
            .sort()
            .limit()
            .paginate().query;

        // Sending Response
        res.json({
            status: 'success',
            results: tours.length,
            data: { tours },
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};
export const getTour = async (req, res) => {
    try {
        console.log(req.params.id);

        const tour = await Tour.findById(req.params.id);
        if (!tour)
            throw new Error('The requested tour not found');
        res.json({
            status: 'success',
            data: tour,
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            error: err,
            message: err.message,
        });
    }
};
export const postTour = async (req, res) => {
    try {
        const tour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: tour,
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};
export const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};
export const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(
            req.params.id
        );
        console.log(tour);

        res.status(204).json({
            status: 'success',
            message: 'tour deleted',
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

export const getStats = async (req, res) => {
    try {
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
            // {
            //     $sort: { duration: 1 },
            // },
        ]);

        res.status(200).json({
            status: 'success',
            results: stats.length,
            data: {
                stats,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};
export const getPlan = async (req, res) => {
    try {
        const year = +req.params.year;
        console.log(req.params);
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
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};
