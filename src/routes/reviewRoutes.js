import * as rc from '../controllers/reviewController.js';
import * as ac from '../controllers/authController.js';
import express from 'express';

// allow merge params to persist /:tourId param from tourRoute
const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(ac.protect);

reviewRouter
    .route('/')
    .get(rc.getAllReviews)
    .post(ac.protect, ac.restrictTo('user'), rc.createReview);

reviewRouter
    .route('/:id')
    .get(rc.getReviewById)
    .patch(ac.restrictTo('user', 'admin'), rc.updateReview)
    .delete(ac.restrictTo('user', 'admin'), rc.deleteReview);

export default reviewRouter;
