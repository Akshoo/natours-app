import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async function (req, res) {
    const tours = await Tour.find();

    res.status(200).render('overview', { title: 'All Tours', tours });
});

export const getTourDetails = catchAsync(async (req, res) => {
    const { slug } = req.params;
    const tour = await Tour.findOne({ slug }).populate({
        path: 'reviews',
        fields: 'user rating description',
    });

    console.log(tour);
    console.log(tour.reviews);
    res.status(200).render('tourDetails', { title: tour.name, tour });
});
