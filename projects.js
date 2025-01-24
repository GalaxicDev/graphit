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
    if (!authToken) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
        const token = authToken.split(' ')[1];
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
};

// Apply extractUserId middleware to all routes
router.use(extractUserId);

// Get all projects
router.get('/', async (req, res) => {
    try {
        const db = await getDB('data');
        const projects = await db.collection('projects').find({ userId: new mongoose.Types.ObjectId(req.userId) }).toArray();
        res.json(projects);
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
        res.json(project);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new project
// Create a new project
router.post('/',
    body('name').isString().isLength({ min: 3 }),
    handleValidationErrors, async (req, res) => {
        try {
            const db = await getDB('data');
            const newProjectData = {
                userId: new mongoose.Types.ObjectId(req.userId),
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
    });


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
});

// Delete a project by ID
router.delete('/:id', param('id').isMongoId(),
    handleValidationErrors, async (req, res) => {
    try {
        const db = await getDB('data');
        const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        if (project.userId.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const result = await db.collection('projects').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

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
    });

export default router;

