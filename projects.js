import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { getDB } from './connectDB.js';
import mongoose from 'mongoose';
import {verifyToken} from "./utils/jwt.js";

const router = express.Router();

// Helper function for handling validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Middleware to extract userId from token
const extractUserId = (req, res, next) => {
    const authToken = req.headers['authorization'];
    if (!authToken) return res.status(401).json({ success: false, message: 'Token required' });
    try {
        const token = authToken.split(' ')[1];
        const decoded = verifyToken(token);
        req.userId = decoded.userId
        next();
    } catch (error) {
        console.log("error", error);
        console.log("invalid token in projects")
        res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

// Apply extractUserId middleware to all routes
router.use(extractUserId);

// Get all projects
router.get('/', async (req, res) => {
    try {
        console.log("trying to pull projects", req.userId, req.headers['authorization']);
        const db = await getDB('data');
        const user = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId(req.userId) });
        if(user.role === 'admin'){
            const projects = await db.collection('projects').find({}).toArray();
            res.json(projects);
        } else {
            const projects = await db.collection('projects').find({
                $or: [
                    { userId: new mongoose.Types.ObjectId(req.userId) },
                    { viewer: new mongoose.Types.ObjectId(req.userId) },
                    { editor: new mongoose.Types.ObjectId(req.userId) }
                ]
            }).toArray();
            console.log("projects", projects);
            res.json(projects);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get a single project by ID
router.get('/:id', param('id').isMongoId(), handleValidationErrors, async (req, res) => {
    try {
        const db = await getDB('data');
        const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
        if (project.userId.toString() !== req.userId.toString() && !project.viewer.map(id => id.toString()).includes(req.userId.toString()) && !project.editor.map(id => id.toString()).includes(req.userId.toString())) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get your own role
router.get('/:id/role', param('id').isMongoId(), handleValidationErrors, async (req, res) => {
    try {
        const db = await getDB('data');
        const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        if (project.userId.equals(new mongoose.Types.ObjectId(req.userId))) {
            return res.json({ role: 'admin' });
        }
        if (project.editor.map(id => id.toString()).includes(req.userId.toString())) {
            return res.json({ role: 'editor' });
        }
        if (project.viewer.map(id => id.toString()).includes(req.userId.toString())) {
            return res.json({ role: 'viewer' });
        }
        
        res.json({ role: 'none' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new project
router.post('/',
    body('name').isString().isLength({ min: 3 }),
    handleValidationErrors, async (req, res) => {
        try {
            const db = await getDB('data');
            const newProjectData = {
                userId: new mongoose.Types.ObjectId(req.userId),
                editor: [],
                viewer: [],
                name: req.body.name,
                description: req.body.description,
                collections: [],
            };
            const result = await db.collection('projects').insertOne(newProjectData);
            // Return the full project object including the inserted ID
            res.status(201).json({ ...newProjectData, _id: result.insertedId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);


router.put('/:id',
    param('id').isMongoId(),
    body('name').isString().isLength({ min: 3 }),
    handleValidationErrors, async (req, res) => {
        try {
            const db = await getDB('data');
            const { _id, userId, ...updateData } = req.body; // Exclude _id and userId from req.body
            const updateProject = await db.collection('projects').findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(req.params.id), userId: new mongoose.Types.ObjectId(req.userId) },
                { $set: updateData },
                { returnDocument: 'after' }
            );

            res.json(updateProject);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

// Delete a project by ID
router.delete('/:id', param('id').isMongoId(),
    handleValidationErrors, async (req, res) => {
        try {
            const db = await getDB('data');
            const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

            // If the project doesn't exist, return 404
            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }

            // Only the project owner can delete the project
            if (project.userId.toString() !== req.userId) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            // try to delete the project, if it doesn't delete anything, return 404 and say project not found
            const result = await db.collection('projects').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, message: 'Issue deleting the project' });
            }

            // delete all graphs associated with the project
            const graphResults = await db.collection('graphs').deleteMany({ projectId: new mongoose.Types.ObjectId(req.params.id) });
            if (graphResults.deletedCount === 0) {
                return res.status(404).json({ success: false, message: 'Issue deleting the graphs' });
            }
            res.json({ success: true, message: 'Project deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

// add a collection to a project
router.post('/:id/collections',
    param('id').isMongoId(),
    body('name').isString(),
    handleValidationErrors, async (req, res) => {
        try {
            const db = await getDB('data');
            // fetch the current collections
            const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }

            if (project.userId.toString() !== req.userId) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const newCollectionData = {
                name: req.body.name,
                fields: [],
            };

            const result = await db.collection('projects').updateOne(
                { _id: new mongoose.Types.ObjectId(req.params.id) },
                { $push: { collections: newCollectionData } }
            );

            if (result.modifiedCount === 0) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }

            res.status(201).json(newCollectionData);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

// change the access of a project
router.post('/:projectId/access',
    param('projectId').isMongoId(),
    body('name').isString(),
    handleValidationErrors, async (req, res) => {
        try {
            const db = await getDB('data');
            const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(req.params.projectId) });
            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }
            // Only the project owner can change access
            if (project.userId.toString() !== req.userId) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            const name = req.body.name;
            const role = req.body.role.toLowerCase();
            //verify if the role is valid
            if (!['admin','editor', 'viewer', 'none'].includes(role)) {
                return res.status(400).json({ success: false, message: 'Invalid role' });
            }

            // Check if user exists
            const user = await db.collection('users').findOne({ name });
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            // Check if the user already has the role
            if (project.editor.includes(user._id) && role === 'editor') {
                return res.status(400).json({ success: false, message: 'User already has editor access' });
            }else if(project.viewer.includes(user._id) && role === 'viewer'){
                return res.status(400).json({ success: false, message: 'User already has viewer access' });
            }

            // If the role is admin, change the project owner
            if (role === 'admin') {
                // Make the previous owner an editor
                await db.collection('projects').updateOne(
                    { _id: new mongoose.Types.ObjectId(req.params.projectId) },
                    { $addToSet: { editor: project.userId } }
                );
                // Remove the new owner from editor and viewer
                await db.collection('projects').updateOne(
                    { _id: new mongoose.Types.ObjectId(req.params.projectId) },
                    { $pull: { editor: user._id, viewer: user._id } }
                );
                // Update the project owner
                const result = await db.collection('projects').updateOne(
                    { _id: new mongoose.Types.ObjectId(req.params.projectId) },
                    { $set: { userId: user._id } }
                );
                
                if (result.modifiedCount === 0) {
                    return res.status(404).json({ success: false, message: 'Project not found' });
                }
                return res.json({ success: true, message: 'Access updated successfully' });
            }else if(role === 'none'){
                const updateData = {
                    $pull: { editor: user._id, viewer: user._id },
                };
    
                const result = await db.collection('projects').updateOne(
                    { _id: new mongoose.Types.ObjectId(req.params.projectId) },
                    updateData
                );
    
                if (result.modifiedCount === 0) {
                    return res.status(404).json({ success: false, message: 'Project not found' });
                }
    
                res.json({ success: true, message: 'Access updated successfully' });

            }else{
                //Remove the user from viewer and editor list and then add them to the desired list
                await db.collection('projects').updateOne(
                    { _id: new mongoose.Types.ObjectId(req.params.projectId) },
                    { $pull: { editor: user._id, viewer: user._id } }
                );

                const updateData = {
                    $addToSet: { [role]: user._id },
                };

                const result = await db.collection('projects').updateOne(
                    { _id: new mongoose.Types.ObjectId(req.params.projectId) },
                    updateData
                );
                if (result.modifiedCount === 0) {
                    return res.status(404).json({ success: false, message: 'Project not found' });
                }
    
                res.json({ success: true, message: 'Access updated successfully' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);
    
export default router;