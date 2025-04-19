import userModel from '../models/userModel.js';

export const createdUser = async (email,password) => {
    if(!email || !password) {
        throw new Error("Email and password are required");
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
        email,
        password: hashedPassword
    });

    return user;
};

export const getAllUsers = async ({userId}) => {
    const allUsers = await userModel.find({_id: {$ne : userId}});

    return allUsers;
}