import express from 'express';
import * as tc from '../controllers/tourController.js';
import * as ac from '../controllers/authController.js';

import reviewRouter from './reviewRoutes.js';

const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter); // Nested Route for Reviews

tourRouter.route('/top-5-cheap').get(tc.topCheapAlias, tc.getAllTours);
tourRouter.route('/stats').get(tc.getStats);

tourRouter
	.route('/plans/:year')
	.get(ac.protect, ac.restrictTo('admin', 'lead-guide', 'guide'), tc.getPlan);

tourRouter
	.route(`/`)
	.get(tc.getAllTours)
	.post(
		ac.protect,
		ac.restrictTo('admin', 'lead-guide'),
		tc.createTour
	);
tourRouter
	.route(`/:id`)
	.get(tc.getTourById)
	.patch(
		ac.protect,
		ac.restrictTo('admin', 'lead-guide'),
		tc.uploadTourPhotos,
		tc.resizeAndPopulateTourPhotos,
		tc.updateTour
	)
	.delete(ac.protect, ac.restrictTo('admin', 'lead-guide'), tc.deleteTour);

tourRouter.route('/tours-within/distance/:distance/centre/:centre/unit/:unit').get(tc.toursWithin);

tourRouter.route('/distance/:latlng/unit/:unit').get(tc.getDistance);
export default tourRouter;
