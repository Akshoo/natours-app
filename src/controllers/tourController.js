import multer from 'multer';
import sharp from 'sharp';
import catchAsync from '../utils/catchAsync.js';
import Tour from '../models/tourModel.js';
import { readAll, readOne, deleteOne, updateOne, createOne } from './handlerFactory.js';
import AppError from '../utils/AppError.js';

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
	const type = file.mimetype.split('/')[0];
	if (type === 'image') return cb(null, true);

	cb(new AppError('Not an Image... Please upload an image file only.', 400));
};

export const uploadTourPhotos = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
}).fields([
	{ name: 'images', maxCount: 3 },
	{ name: 'imageCover', maxCount: 1 },
]);

export const resizeAndPopulateTourPhotos = async function (req, res, next) {
	if (!req.files.image || !req.files.imageCover) return next();

	const save = async function (buffer, filename) {
		await sharp(buffer)
			.resize(2000, 1333)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(`public/img/tours/${filename}`);
	};
	const mapFn = async function (file) {
		const filename = `tour-${req.params.id}-${Date.now()}.jpeg`;
		await save(file.buffer, filename);
		// console.log(file.originalname);
		return filename;
	};
	req.body.images = await Promise.all(req.files.images.map(mapFn));
	[req.body.imageCover] = await Promise.all(req.files.imageCover.map(mapFn));
	next();
};

export const topCheapAlias = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = 'price,ratingsAverage';
	req.query.fields = 'name,ratings,difficulty,summary,duration,price';

	next();
};

export const getAllTours = readAll(Tour);
export const getTourById = readOne(Tour, {
	path: 'reviews',
	select: 'name description rating -tour',
});
export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);

export const toursWithin = catchAsync(async function (req, res) {
	const distance = req.params.distance;
	const radius = req.params.unit === 'km' ? distance / 6378 : distance / 3963;
	const [lat, lng] = req.params.centre.split(',');

	if (!lat || lng) new AppError('Please provide latitude and longitude as lat,lng', 400);

	const tours = await Tour.find({
		startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});

	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: tours,
	});
});

export const getDistance = catchAsync(async function (req, res) {
	const { unit } = req.params;
	const [lat, lng] = req.params.latlng.split(',');
	const multiplier = unit === 'km' ? 6378 : 3963;
	// const multiplier = 1;

	if (!lat || lng) new AppError('Please provide latitude and longitude as lat,lng', 400);

	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: [+lng, +lat],
				distanceField: 'distance',
				distanceMultiplier: multiplier,
				spherical: true,
			},
		},
		{
			$project: {
				name: 1,
				distance: 1,
			},
		},
	]);

	res.status(200).json({
		status: 'success',
		results: distances.length,
		data: distances,
	});
});

// Aggregation pipeline controller functions
export const getStats = catchAsync(async function (req, res) {
	const stats = await Tour.aggregate([
		{
			$match: { price: { $lte: 3000 } },
		},
		{
			$group: {
				_id: '$difficulty',
				numTours: { $count: {} },
				numRatings: {
					$sum: '$ratingsQuantity',
				},
				avgRatings: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' },
			},
		},
		{
			$sort: { avgPrice: 1 },
		},
	]);

	res.status(200).json({
		status: 'success',
		results: stats.length,
		data: {
			stats,
		},
	});
});

export const getPlan = catchAsync(async function (req, res) {
	const year = +req.params.year;
	const plan = await Tour.aggregate([
		{
			$unwind: '$startDates',
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}`),
					$lt: new Date(`${year + 1}`),
				},
			},
		},
		{
			$group: {
				_id: { $month: '$startDates' },
				numTours: { $sum: 1 },
				tours: {
					$push: {
						_id: '$_id',
						name: '$name',
					},
				},
				// tours: { $push: '$$ROOT' },
			},
		},
		{
			$addFields: {
				month: '$_id',
			},
		},
		{
			$sort: { numTours: -1 },
		},
		{
			$limit: 12,
		},
		{
			$project: {
				_id: 0,
			},
		},
	]);

	res.status(200).json({
		status: 'success',
		results: plan.length,
		data: {
			plan,
		},
	});
});
