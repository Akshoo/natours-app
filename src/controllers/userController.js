import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import filterObj from '../utils/filterObj.js';

export const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: users,
    });
});
export const getUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({
        status: 'success',
        user,
    });
});
export const postUser = catchAsync(async (req, res, next) => {
    res.status(500).json({
        status: 'fail',
        message: 'This route is not implemented yet...',
    });
});
export const updateUser = catchAsync(async (req, res, next) => {
    // this route must be protected
    const user = req.currentUser;
    if (!user) return next(new AppError('Must be logged in to update user data', 501));

    // if user tries to change password, warn
    if (req.body.password || req.body.passwordConfirm)
        return next(new AppError('Cannot change password on this route', 400));

    // sanitize request
    const updatedUserObj = filterObj(req.body, 'name', 'email');
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
export const deleteUser = catchAsync(async (req, res, next) => {
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
