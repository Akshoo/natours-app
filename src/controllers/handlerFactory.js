import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';

export const readAll = (Model, filter) =>
    catchAsync(async (req, res, next) => {
        let query;

        if (filter) {
            query = new APIFeatures(req.query, Model.find(filter))
                .filter()
                .sort()
                .limit()
                .paginate().query;
        } else query = Model.find();

        const doc = await query;

        res.json({
            status: 'success',
            results: doc.length,
            data: doc,
        });
    });

// catchAsync(async (req, res, next) => {
//     const tourId = req.params.tourId;
//     let filter = {};
//     if (tourId) filter = { tour: tourId };

//     const reviews = await new APIFeatures(req.query, Review.find(filter))
//         .filter()
//         .sort()
//         .limit()
//         .paginate().query;

//     res.json({
//         status: 'success',
//         results: reviews.length,
//         reviews,
//     });
// });

export const readOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        const query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);

        const doc = await query;
        if (!doc)
            return next(new AppError('The requested resource not found of that Id', 404));

        res.status(200).json({
            status: 'success',
            data: doc,
        });
    });

export const deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc)
            return next(new AppError('The requested resource not found of that Id', 404));

        res.status(204).json({
            status: 'success',
            message: 'tour deleted',
        });
    });

export const updateOne = (Model) =>
    catchAsync(async function (req, res, next) {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(new AppError('The requested resource not found of that Id', 404));
        }
        res.json({
            status: 'success',
            data: doc,
        });
    });

export const createOne = (Model) =>
    catchAsync(async function (req, res) {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: doc,
        });
    });
