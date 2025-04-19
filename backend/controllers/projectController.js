import userModel from '../models/userModel.js';
import * as projectService from '../services/projectService.js';
import {validationResult} from 'express-validator';

export const createProject = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const userId = loggedInUser._id; 
        const newProject = await projectService.createProject({ name, userId });
        res.status(201).json({newProject});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    } 
    
};
    
export const getAllProjects = async (req,res) => {
  try {
    const loggedInUser = await userModel.findOne({email: req.user.email})

    const allUserProjects = await projectService.getAllProjectsByUserId({userId : loggedInUser._id})

    return res.status(200).json({
        projects: allUserProjects
    })
  }
   catch (error) {
    console.log(error)
    res.status(400).json({message: error.message})
  }
};

export const addUsersToProject = async (req,res) => {
    const errors = validationResult(req)
    
    if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()})
    }
    
    try {
        const {projectId,users} = req.body;

        const loggedInUser = await userModel.findOne({email: req.user.email})

        const project = await projectService.addUsersToProject({projectId,users,userId: loggedInUser._id})

        return res.status(200).json({project})
    } 
    catch (error) {
        console.log(error)
        res.status(400).json({message : error.message})
    }
};

export const getProjectById = async (req,res) => {

    const {projectId} = req.params;

    try {
        const project = await projectService.getProjectById({projectId})

        return res.status(200).json({
            project: project
        })
    } 
    catch (error) {
        console.log(error.message)
        res.status(400).json({message: error.message})
    }
}