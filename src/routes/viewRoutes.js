import express from 'express';
import * as vc from '../controllers/viewController.js';
import * as ac from '../controllers/authController.js';

const viewRouter = express.Router();

viewRouter.use(ac.isLoggedIn);

viewRouter.route('/').get(vc.getOverview);
viewRouter.route('/tour/:slug').get(vc.getTourDetails);
viewRouter.route('/login').get(vc.getLogin);

export default viewRouter;
