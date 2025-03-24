import express from 'express';
import * as vc from '../controllers/viewController.js';

const viewRouter = express.Router();

viewRouter.route('/').get(vc.getOverview);
viewRouter.route('/tour/:slug').get(vc.getTourDetails);

export default viewRouter;
