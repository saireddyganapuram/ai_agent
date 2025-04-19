import projectModel from '../models/projectModel.js';
import mongoose from 'mongoose';

export const createProject = async ({ name, userId }) => {
    if (!name) {
        throw new Error('Project name is required');
    }

    if (!userId) {
        throw new Error('User ID is required');
    }

    try {
        const project = new projectModel({ name, users: [userId] });
        await project.save();
        return project;
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error code
            throw new Error('Project name already exists');
        }
        throw error; // Re-throw other errors
    }
};

export const getAllProjectsByUserId = async ({userId}) => {
    if(!userId) {
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({users : userId})

    return allUserProjects
};

export const addUsersToProject = async ({projectId,users,userId}) => {
    if(!projectId) {
        throw new Error('projectId is required')
    }

    if(!users) {
        throw new Error('users is required')
    }

    if(!userId) {
        throw new Error('userId is required')
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid userId');
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error('Invalid user IDs in the users array');
    }

    const project = await projectModel.findOne({_id: projectId,users: userId})


    if(!project) {
        throw new Error('User not belongs to this project')
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each : users
            }
        }
    }, {
        new: true
    })
    await updatedProject.save()

    return updatedProject
};

export const getProjectById = async ({projectId}) => {

    if(!projectId) {
        throw new Error('projectId is required');
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId format");
    }

    const project = await projectModel.findOne({_id: projectId}).populate('users');

    return project;
};  