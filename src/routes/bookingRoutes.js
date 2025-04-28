import * as ac from '../controllers/authController.js';
import * as bc from '../controllers/bookingController.js';
import express from 'express';

const bookingRouter = express.Router();

bookingRouter.get('/checkout-session/:tourId', ac.protect, bc.getCheckout);

bookingRouter.use(ac.protect, ac.restrictTo('admin', 'lead-guide'));

bookingRouter.route('/').get(bc.getAllBookings).post(bc.createBooking);
bookingRouter.route('/:id').get(bc.getBookingById).patch(bc.updateBooking).delete(bc.deleteBooking);


export default bookingRouter;
