import express from 'express';
import * as vc from '../controllers/viewController.js';
import * as ac from '../controllers/authController.js';

const viewRouter = express.Router();

viewRouter.route('/me').get(ac.protect, vc.getMe);
// Update user details is also implemented via client side js script thus this is basically useless
viewRouter.route('/update-user-form-data').post(ac.protect, vc.updateUserDetails);

viewRouter.use( ac.isLoggedIn);

viewRouter.route('/').get(vc.getOverview);
viewRouter.route('/myBookings').get(vc.getMyBookings);
viewRouter.route('/tour/:slug').get(vc.getTourDetails);
viewRouter.route('/login').get(vc.getLogin);

export default viewRouter;
