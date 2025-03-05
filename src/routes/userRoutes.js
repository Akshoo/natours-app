import express from 'express';
import * as uc from '../controllers/userController.js';
import * as ac from '../controllers/authController.js';
const userRouter = express.Router();
userRouter
    .route(`/`)
    .get(ac.protect, ac.restrictTo('admin'), uc.getAllUsers)
    .post(uc.createUser);

userRouter.route('/signup').post(ac.signup);
userRouter.route('/login').post(ac.login);

userRouter.route('/forgotPassword').post(ac.forgotPassword);
userRouter.route('/resetPassword/:passResetToken').patch(ac.resetPassword);

// Protect all routes after this middleware
userRouter.use(ac.protect);

userRouter.route('/me').get(uc.getMe, uc.getUserById);
userRouter.route('/updateMe').patch(uc.updateMe);
userRouter.route('/deleteMe').delete(uc.deleteMe);
userRouter.route('/updateMyPassword').patch(ac.updatePassword);

// Restrict all routes to admins after this middleware
userRouter.use(ac.restrictTo('admin'));

userRouter.route(`/:id`).get(uc.getUserById).patch(uc.updateUser).delete(uc.deleteUser);

export default userRouter;
