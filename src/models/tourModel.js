import mongoose from 'mongoose';
import slugify from 'slugify';

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            minLength: [10, 'name must be of min 10 characters'],
            maxLength: [40, 'name must be of max 40 characters'],
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
            // required: {
            //     value: true,
            //     message: 'A tour must have a duration',
            // },
            // enum: [7, 14, 21],
            // validate: {
            //     // check that duration must be of whole weeks
            //     validator: function (val) {
            //         console.log(val);
            //         return val % 7 == 0;
            //     },
            // },
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a maximum group size'],
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: 1,
            max: 5,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
            // unique: true,
        },
        priceDiscount: Number,
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'difficult', 'hard'],
                message: `difficulty can only be either 'easy', 'difficult' or 'hard' `,
            },
        },
        summary: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have an image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now,
            select: false,
        },
        startDates: [Date],
        slug: {
            type: String,
        },
        secret: {
            type: Boolean,
            default: false,
        },
        //GeoJSON
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'user',
            },
        ],
    },
    {
        virtuals: {
            duraionWeeks: {
                get() {
                    return this.duration && this.duration / 7;
                },
            },
            reviews: {
                options: {
                    ref: 'review',
                    foreignField: 'tour',
                    localField: '_id',
                },
            },
            numReviews: {
                get() {
                    return this.reviews?.length;
                },
            },
        },
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Runs before any document is saved ie .save() and .create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true,
    });
    next();
});

// QUERY middleware

//populating guides in tours
tourSchema.pre(/^find/, function (next) {
    if (!this._fields || 'guides' in this._fields)
        this.populate({ path: 'guides', select: 'name photo email' });

    next();
});

//deselecting secret tours
tourSchema.pre(/^find/, function (next) {
    this.find({ secret: { $ne: true } }).select('-secret -__v');
    next();
});

// AGGREGATE middleware
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: { secret: { $ne: true } },
    });
    next();
});

const Tour = mongoose.model('tour', tourSchema);
export default Tour;
