import express from 'express';
import * as uc from '../controllers/userController.js';

const userRouter = express.Router();
userRouter.route(`/`).get(uc.getAllUsers).post(uc.postUser);
userRouter
    .route(`/:id`)
    .get(uc.getUser)
    .patch(uc.patchUser)
    .delete(uc.deleteUser);

export default userRouter;
