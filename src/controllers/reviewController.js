import catchAsync from '../utils/catchAsync.js';
import filterObj from '../utils/filterObj.js';
import APIFeatures from '../utils/APIFeatures.js';
import Review from '../models/reviewModel.js';
import { readAll, readOne, deleteOne, updateOne } from './handlerFactory.js';

export const getAllReviews = readAll(Review);

export const createReview = catchAsync(async (req, res, next) => {
    // Allowing nested routes and non nested routes
    const userId = req.body.user || req.currentUser.id;
    const tourId = req.body.tour || req.params.tourId;

    const newReviewObj = filterObj(req.body, 'tour', 'user', 'description', 'rating');
    newReviewObj.user = userId;
    newReviewObj.tour = tourId;

    const review = await Review.create(newReviewObj);

    res.status(201).json({
        status: 'success',
        message: 'review posted successfully',
        data: review,
    });
});

export const getReviewById = readOne(Review);
export const deleteReview = deleteOne(Review);
export const updateReview = updateOne(Review);
