import * as rc from '../controllers/reviewController.js';
import * as ac from '../controllers/authController.js';
import express from 'express';

const reviewRouter = express.Router();

reviewRouter
    .route('/')
    .get(ac.protect, rc.getAllUserReviews)
    .post(ac.protect, ac.restrictTo('user'), rc.postReview);

reviewRouter.route('/:id').get(rc.getReviewById);

export default reviewRouter;
