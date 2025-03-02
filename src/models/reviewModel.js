import mongoose from 'mongoose';

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

reviewSchema.pre(/^find/, function (next) {
    console.log('review pre hook');

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

const Review = mongoose.model('review', reviewSchema);

export default Review;
