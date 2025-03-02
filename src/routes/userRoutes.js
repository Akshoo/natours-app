import express from 'express';
import * as uc from '../controllers/userController.js';
import * as ac from '../controllers/authController.js';
const userRouter = express.Router();
userRouter.route(`/`).get(uc.getAllUsers).post(uc.createUser);

userRouter.route('/signup').post(ac.signup);
userRouter.route('/login').post(ac.login);

userRouter.route('/forgotPassword').post(ac.forgotPassword);
userRouter.route('/resetPassword/:passResetToken').patch(ac.resetPassword);

userRouter.route('/updateMyPassword').patch(ac.protect, ac.updatePassword);
userRouter.route('/updateMe').patch(ac.protect, uc.updateMe);
userRouter.route('/deleteMe').delete(ac.protect, uc.deleteMe);

userRouter
    .route(`/:id`)
    .get(uc.getUserById)
    .patch(ac.protect, ac.restrictTo('admin'), uc.updateUser)
    .delete(ac.protect, ac.restrictTo('admin'), uc.deleteUser);

export default userRouter;
