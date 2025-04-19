import { Router } from "express";
import { body } from "express-validator";
import * as userController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post('/register',
    body('email').isEmail().withMessage('Email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    userController.createdUserController
);

router.post('/login',
    body('email').isEmail().withMessage('Email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    userController.loginUserController
);

router.get('/profile',authMiddleware,userController.getUserProfileController);

router.get('/logout', authMiddleware,userController.logoutUserController);

router.get('/all',authMiddleware,userController.getAllUsers)

export default router;