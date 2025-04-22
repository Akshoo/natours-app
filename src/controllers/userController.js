import multer from 'multer';
import sharp from 'sharp';
import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import filterObj from '../utils/filterObj.js';
import { readAll, readOne, deleteOne, updateOne } from './handlerFactory.js';

// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, './public/img/users');
// 	},
// 	filename: (req, file, cb) => {
// 		const user = req.currentUser;
// 		const uniqueSuffix = `${user.id}-${Date.now()}`;
// 		const ext = file.mimetype.split('/')[1];

// 		cb(null, `user-${uniqueSuffix}.${ext}`);
// 	},
// });
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
	const type = file.mimetype.split('/')[0];
	if (type === 'image') return cb(null, true);

	cb(new AppError('Not an Image... Please upload an image file only.', 400));
};
// export const uploadUserPhoto = multer({ storage, fileFilter }).single('photo');

export const uploadUserPhoto = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
}).single('photo');
export const resizeUserPhoto = (req, res, next) => {
	if (!req.file) return next();

	const user = req.currentUser;
	const uniqueSuffix = `${user.id}-${Date.now()}`;

	// defining req.file.filename for later use in updateMe middleware
	req.file.filename = `user-${uniqueSuffix}.jpeg`;
	sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/users/${req.file.filename}`);

	next();
};

export const getMe = (req, res, next) => {
	req.params.id = req.currentUser.id;
	next();
};

export const getAllUsers = readAll(User);
export const getUserById = readOne(User);

export const createUser = (req, res, next) => {
	res.status(500).json({
		status: 'fail',
		message: 'This route is not defined. Please use /signup instead',
	});
};

export const updateMe = catchAsync(async (req, res, next) => {
	console.log('here  you little duck');
	const user = req.currentUser;

	// if user tries to change password then warn
	if (req.body.password || req.body.passwordConfirm)
		return next(new AppError('Cannot change password on this route', 400));

	console.log('UPDATE PHOTO', req.body, req.file);
	// sanitize request
	const updatedUserObj = filterObj(req.body, 'name', 'email');
	if (req.file) updatedUserObj.photo = req.file.filename;
	console.log(updatedUserObj);

	// actually update the user
	const updatedUser = await User.findByIdAndUpdate(user.id, updatedUserObj, {
		new: true, // returns new updated user
		runValidators: true, // runs the validators, false by default
	});

	res.status(200).json({
		status: 'success',
		message: 'User data changed successfully',
		updatedUser,
	});
});

export const deleteMe = catchAsync(async (req, res, next) => {
	//this route is protected
	const user = req.currentUser;
	if (!user) return next(new AppError('Must be logged in to update user data', 501));

	const duser = await User.findByIdAndUpdate(user.id, { active: false }, { new: true });

	res.status(200).json({
		status: 'success',
		message: 'User Deleted',
		duser,
	});
});

export const deleteUser = deleteOne(User);
export const updateUser = updateOne(User);
