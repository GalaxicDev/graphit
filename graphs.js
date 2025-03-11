import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { getDB } from './connectDB.js';
import mongoose from 'mongoose';
import { verifyToken } from "./utils/jwt.js";
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 * 60 }); // 1 hour cache

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

// Get all graphs for a project
router.get('/project/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const cacheKey = `project-graphs-${projectId}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        console.log("Returning cached data for project graphs");
        return res.json(cachedData);
    }

    try {
        const db = await getDB('data');
        const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(projectId) });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        const graphs = await db.collection('graphs').find({ projectId: new mongoose.Types.ObjectId(req.params.projectId) }).toArray();
        cache.set(cacheKey, graphs);

        res.json(graphs);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get a single graph by ID
router.get('/:id', param('id').isMongoId(), handleValidationErrors, async (req, res) => {
    try {
        const db = await getDB('data');
        const graph = await db.collection('graphs').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        if (!graph) {
            return res.status(404).json({ success: false, message: 'Graph not found' });
        }
        res.json(graph);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new graph
router.post('/',
    body('projectId').isString().withMessage('Project ID is required'),
    body('chartType').isString().withMessage('Chart Type is required'),
    body('options').isObject().withMessage('Options must be an object'),
    body('elements').isArray().withMessage('Elements must be an array'),
    handleValidationErrors,
    async (req, res) => {
        console.log("Creating new graph", req.body);
        try {
            const db = await getDB('data');
            // Check if the user either owns the project or is an editor
            const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(req.body.projectId) });
            if (project.userId.toString() !== req.userId.toString() && !project.editor.map(id => id.toString()).includes(req.userId.toString())) {
                res.status(403).json({ success: false, message: 'Access denied' });
                return;
            }
            // Create a new graph object
            const newGraphData = {
                projectId: new mongoose.Types.ObjectId(req.body.projectId),
                chartType: req.body.chartType,
                options: req.body.options,
                elements: req.body.elements,
            };
            const result = await db.collection('graphs').insertOne(newGraphData);
            // Return the full graph object including the inserted ID
            res.status(201).json({ ...newGraphData, _id: result.insertedId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// Update a graph by ID
router.put('/:id',
    param('id').isMongoId(),
    body('name').isString().isLength({ min: 3 }),
    handleValidationErrors, async (req, res) => {
        try {
            const db = await getDB('data');
            const graph = await db.collection('graphs').findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(req.params.id) },
                { $set: req.body },
                { returnOriginal: false }
            );
            if (!graph.value) {
                return res.status(404).json({ success: false, message: 'Graph not found' });
            }
            res.json(graph.value);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// Delete a graph by ID
router.delete('/:id', param('id').isMongoId(),
    handleValidationErrors, async (req, res) => {
        try {
            const db = await getDB('data');
            const graph = await db.collection('graphs').findOneAndDelete({ _id: new mongoose.Types.ObjectId(req.params.id) });
            if (!graph.value) {
                return res.status(404).json({ success: false, message: 'Graph not found' });
            }
            res.json(graph.value);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

export default router;