import catchAsync from '../utils/catchAsync.js';
import filterObj from '../utils/filterObj.js';
import AppError from '../utils/AppError.js';
import Review from '../models/reviewModel.js';

export const getAllUserReviews = catchAsync(async (req, res, next) => {});

export const postReview = catchAsync(async (req, res, next) => {
    // this route must be protected
    const user = req.currentUser;
    const reviewTourId = req.params.tourId;
    if (!user) next(new AppError('Must be logged in to access this route', 501));

    const newReviewObj = filterObj(req.body, 'tour', 'description', 'rating');
    newReviewObj.user = user.id;
    newReviewObj.tour = newReviewObj.tour || reviewTourId;

    const review = await Review.create(newReviewObj);

    res.status(201).json({
        status: 'success',
        message: 'review posted successfully',
        data: review,
    });
});

export const getReviewById = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const review = await Review.findById(id);
    if (!review) next(new AppError('The requested review not found', 404));

    res.status(200).json({
        status: 'success',
        review,
    });
});
