import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/email.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import User from '../models/userModel.js';
import filterObj from '../utils/filterObj.js';

const signJWT = async (data) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            data,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN,
            },
            (err, token) => {
                if (err) reject(err);
                else resolve(token);
            }
        );
    });
};

const verifyJWT = async (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        });
    });
};

const createAndSendJWT = async (data, res, user) => {
    const token = await signJWT(data);

    res.cookie('jwt', token, {
        httpOnly: true,
        secret: true,
        expires: new Date(
            Date.now() + process.env.JWT_EXPIRES_IN_INT * 24 * 60 * 60 * 1000
        ),
        secure: process.env.NODE_ENV == 'prod' ? true : undefined,
    });
    res.status(200).json({
        status: 'success',
        token,
        user,
    });
};

export const protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) check if token is present
    if (req.headers.authorization?.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1];

    if (!token)
        return next(new AppError('Must be Logged in to access this resource', 401));

    // 2) Verify the token
    const decoded = await verifyJWT(token);

    // 3) Check if the user still exists
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('The user of this token does not exists'));

    // 4) Check if user has changed password after acquiring token

    if (user.changedPasswordAfterTime(decoded.iat * 1000))
        return next(
            new AppError('Password changed after token issued, Please login again', 401)
        );

    // Grant access after all checks
    req.currentUser = user;
    next();
});

export const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.currentUser.role;
        if (!allowedRoles.includes(userRole))
            next(`Permission denied, a ${userRole} acnnot acces this resource`);

        next();
    };
};

export const signup = catchAsync(async (req, res, next) => {
    const newUserObj = filterObj(
        req.body,
        'name',
        'email',
        'password',
        'passwordConfirm'
    );
    // const newUser = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm: req.body.passwordConfirm,
    // });
    const newUser = await User.create(newUserObj);

    newUser.password = undefined;
    await createAndSendJWT({ id: newUser._id }, res, newUser);
});

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return next(new AppError('Email and Password is required', 400));

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password)))
        return next(new AppError('Incorrect  Password or Username', 401));

    await createAndSendJWT({ id: user._id }, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
    const userEmail = req.body.email;
    if (!userEmail) return next(new AppError('User email is required to reset password'));

    const user = await User.findOne({ email: userEmail });
    if (!user) return next(new AppError('User not found, Please signup'));

    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.hostname}:${process.env.PORT}/resetPassword/${resetToken}`;

    try {
        await sendEmail({
            email: userEmail,
            subject: 'Password reset token, valid for 10 minutes',
            message: `Forgot your password..., submit a PATCH request at \n ${resetUrl} \n with your new password and passwordConfirm. \nIf you didn't forget your password, then please ignore this email`,
        });

        res.status(200).json({
            status: 'success',
            message: 'Reset token is sent to the registered email',
        });
    } catch (err) {
        await user.deletePasswordResetToken();
        next(
            new AppError('Could not send reset password email, some error occoured', 500)
        );
    }
});

export const resetPassword = catchAsync(async (req, res, next) => {
    // check if resetToken, password and passwordConfirm, all are available
    const token = req.params.passResetToken;
    if (!token)
        return next(new AppError('reset token is required to reset your password', 400));

    const { password, passwordConfirm } = req.body;
    if (!password || !passwordConfirm)
        return next(
            new AppError(
                'Please send your new password along with passwordConfirm to reset your password',
                400
            )
        );

    // check if a user with the token exists and the token isn't expired
    const hashToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetTokenExpires: { $gt: Date.now() },
    });

    if (!user)
        return next(new AppError('password reset token expired or incorrect', 400));

    // change the password of the user and modify passwordChangedAt of the user (presave hook)
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    // send a jwt to log the user in
    await createAndSendJWT({ id: user._id }, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
    // this route must be protected
    const user = await User.findById(req.currentUser._id).select('+password');
    if (!user) return next('Must be logged in to update password', 501);

    const { passwordCurrent, password, passwordConfirm } = req.body;
    if (!passwordCurrent || !password || !passwordConfirm)
        return next(
            new AppError(
                'Please send your passwordCurrent along with password and passwordConfirm to update your password',
                400
            )
        );

    if (!(await user.correctPassword(passwordCurrent, user.password)))
        return next(new AppError('Incorrect password entered', 401));

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    // send a jwt to log the user in
    await createAndSendJWT({ id: user._id }, res);
});
