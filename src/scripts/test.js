import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv/config';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const carSchema = mongoose.Schema(
    {
        name: String,
        since: Date,
    },
    {
        virtuals: {
            age: {
                get: function () {
                    return new Date() - this.since.getYear();
                },
            },
            buyers: {
                options: {
                    ref: 'buyer',
                    localField: '_id',
                    foreignField: 'car',
                },
            },
        },
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
// carSchema.virtual('age').get(function(){return new Date.now().getYear() - this.since.getYear();})

const Car = mongoose.model('car', carSchema);

const buyerSchema = mongoose.Schema({
    name: String,
    car: {
        type: mongoose.Schema.ObjectId,
        ref: 'car',
    },
});

buyerSchema.pre(/^find/, function (next) {
    // console.log('-car' in this._fields, this._fields);
    if (!('-car' in this._fields)) this.populate({ path: 'car' });
    next();
});

const Buyer = mongoose.model('buyer', buyerSchema);

const dbUri = process.env.DB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);
const init = async function () {
    try {
        await mongoose.connect(dbUri);
        console.log('connection to database successfull from script');

        // await Car.create({ name: 'VolksWagen', since: 2003 });
        // await Buyer.create({ name: 'Makhija', car: '66e5a4b0c8fbb7f6121389de' });
        console.log(
            await Buyer.findById('66e5a58f29d5aa2f95ec7aae').select('-guides name')
        );
        // console.log(await Car.findById('66e5a4b0c8fbb7f6121389de').populate('buyers'));
    } catch (err) {
        console.log(err);
    }
};
init();
