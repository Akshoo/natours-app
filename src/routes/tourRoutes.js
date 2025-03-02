import express from 'express';
import * as tc from '../controllers/tourController.js';
import * as ac from '../controllers/authController.js';

import reviewRouter from './reviewRoutes.js';

const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter); // Nested Route for Reviews

tourRouter.route('/top-5-cheap').get(tc.topCheapAlias, tc.getAllTours);
tourRouter.route('/stats').get(tc.getStats);

tourRouter.route('/plans/:year').get(tc.getPlan);

tourRouter.route(`/`).get(ac.protect, tc.getAllTours).post(tc.createTour);
tourRouter
    .route(`/:id`)
    .get(tc.getTourById)
    .patch(tc.updateTour)
    .delete(ac.protect, ac.restrictTo('admin', 'lead-guide'), tc.deleteTour);

export default tourRouter;
