import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';

export const readAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // (hack) workaround for getting reviews for a specific tour
        const tourId = req.params.tourId;
        let filter = {};
        if (tourId) filter = { tour: tourId };
        //

        const doc = await new APIFeatures(req.query, Model.find(filter))
            .filter()
            .sort()
            .limit()
            .paginate().query;

        res.json({
            status: 'success',
            results: doc.length,
            data: doc,
        });
    });

export const readOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
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
            message: 'data deleted',
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
