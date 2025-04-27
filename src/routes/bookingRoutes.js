import * as ac from '../controllers/authController.js';
import * as bc from '../controllers/bookingController.js';
import express from 'express';

const bookingRouter = express.Router();

bookingRouter.get('/checkout-session/:tourId', ac.protect, bc.getCheckout);
bookingRouter.get('/payment-success', ac.protect, bc.getPaymentSuccess);
bookingRouter.get('/payment-fail', ac.protect, bc.getPaymentFail);

export default bookingRouter;
