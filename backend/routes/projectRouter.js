import {Router} from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/projectController.js';
import  authMiddleware  from '../middleware/authMiddleware.js';
 
const router = Router();

router.post('/create',
    authMiddleware,
    body('name').notEmpty().withMessage('Project name is required'),
    projectController.createProject
);

router.get('/all',
    authMiddleware,
    projectController.getAllProjects
);

router.put('/add',
    authMiddleware,
    body('projectId').isString().withMessage('ProjectId is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be a non-empty array of strings')
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUsersToProject
);

router.get('/get-project/:projectId',
    authMiddleware,
    projectController.getProjectById
)

export  default router;