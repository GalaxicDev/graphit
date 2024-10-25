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
    if (!authToken) return res.status(403).json({ success: false, message: 'Token required' });

    console.log('authToken:', authToken);
    try {
        const token = authToken.split(' ')[1];
        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({ success: false, message: 'Invalid token' });
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
            console.log('result:', result);
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
            const updateProject = await db.collection('projects').findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(req.params.id) },
                { $set: req.body },
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
        const project = await db.collection('projects').findOneAndDelete({ _id: new mongoose.Types.ObjectId(req.params.id) });
        if (!project.value) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json(project.value);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;

