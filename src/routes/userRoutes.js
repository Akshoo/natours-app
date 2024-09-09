import express from 'express';
import * as uc from '../controllers/userController.js';
import * as ac from '../controllers/authController.js';
const userRouter = express.Router();
userRouter.route(`/`).get(uc.getAllUsers).post(uc.postUser);

userRouter.route('/signup').post(ac.signup);
userRouter.route('/login').post(ac.login);

userRouter.route('/forgotPassword').post(ac.forgotPassword);
userRouter.route('/resetPassword/:passResetToken').patch(ac.resetPassword);

userRouter.route('/updateMyPassword').patch(ac.protect, ac.updatePassword);
userRouter.route('/updateMe').patch(ac.protect, uc.updateUser);
userRouter.route('/deleteMe').delete(ac.protect, uc.deleteUser);

userRouter.route(`/:id`).get(uc.getUser); //.patch(uc.patchUser).delete(uc.deleteUser);

export default userRouter;
