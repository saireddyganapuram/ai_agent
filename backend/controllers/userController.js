import userModel from '../models/userModel.js';
import * as userServices from '../services/userServices.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redisServices.js';

export const createdUserController = async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userServices.createdUser(req.body.email, req.body.password);

        const token = await user.generateAuthToken();

        delete user._doc.password;

        res.status(201).json({user,token});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const loginUserController = async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        delete user._doc.password;

        const token = await user.generateAuthToken();
        res.status(200).json({ user, token });
    } catch (error) {

        console.log(error);

        res.status(400).json({ message: error.message });
    }
};

export const getUserProfileController = async (req, res) => {
    const user = req.user;
    return res.status(200).json({ user });
};

export const logoutUserController = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized user" });
    }

    try {
        await redisClient.set(token, true, { EX: 60 * 60 * 24});

        res.clearCookie('token');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {

        console.log(error);

        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req,res) => {
    try {

        const loggedInUser = await userModel.findOne({email: req.user.email});

        const allUsers = await userServices.getAllUsers({userId: loggedInUser._id})

        return res.status(200).json({
            users: allUsers
        })

    } catch (error) {
        console.log(error.message)
        res.status(400).json({message: error.message})
    }
}