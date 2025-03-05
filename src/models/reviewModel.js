import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync.js';
import Tour from './tourModel.js';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            required: [true, 'A review must belong to a user'],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'tour',
            required: [true, 'A review must belong to a tour'],
        },
        description: {
            type: String,
            required: [true, 'A review must have a descrption'],
        },
        rating: {
            type: Number,
            enum: [1, 2, 3, 4, 5],
            required: [true, 'A review must have a rating'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

//Might not work immediately
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.select('-__v');

    this.populate({
        path: 'tour',
        select: 'name',
        // populate: { path: 'guides', select: 'name email' },
    }).populate({
        path: 'user',
        select: 'name photo',
    });

    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const [stats] = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: tourId,
                ratingsAverage: { $avg: '$rating' },
                ratingsQuantity: { $sum: 1 },
            },
        },
    ]);

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats.ratingsQuantity,
        ratingsAverage: stats.ratingsAverage,
    });
};

reviewSchema.post('save', function (next) {
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.rev = await this.model.findOne(this.getQuery());
    console.log(this.getQuery());
    next();
});
reviewSchema.post(/^findOneAnd/, async function () {
    if (this.rev) this.r.constructor.calcAverageRatings(this.r.tour._id);
});

const Review = mongoose.model('review', reviewSchema);

export default Review;
