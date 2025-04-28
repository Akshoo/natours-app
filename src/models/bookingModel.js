import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
	tour: {
		type: mongoose.Schema.ObjectId,
		ref: 'tour',
		required: [true, 'A booking must have a Tour'],
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'user',
		required: [true, 'A booking must have a User'],
	},
	price: {
		type: Number,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	paid: {
		type: Boolean,
		default: true,
	},
});

bookingSchema.pre(/^find/, function (next) {
	this.populate('user').populate({
		path: 'tour',
		select: 'name',
	});
	next();
});

const Booking = mongoose.model('booking', bookingSchema);
export default Booking;
