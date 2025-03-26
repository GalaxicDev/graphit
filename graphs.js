import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { getDB } from './connectDB.js';
import mongoose from 'mongoose';
import { verifyToken } from "./utils/jwt.js";
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 * 60 * 5 }); // 5 hour cache
dotenv.config();

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
            // Retrieve project information
            const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(String(req.body.projectId)) });
            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }
            // Retrieve user information
            const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(String(req.userId)) });
            // Allow access if user is admin, owns the project, or is an editor
            if (!(user && user.role === 'admin') && (project.userId.toString() !== String(req.userId) && !project.editor.map(id => id.toString()).includes(String(req.userId)))) {
                return res.status(403).json({ success: false, message: 'Access denied' });
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

// Update an existing graph with new options
router.put('/:id',
    param('id').isMongoId(),
    body('projectId').isString().withMessage('Project ID is required'),
    body('chartType').isString().withMessage('Chart Type is required'),
    body('options').isObject().withMessage('Options must be an object'),
    body('elements').isArray().withMessage('Elements must be an array'),
    handleValidationErrors,
    async (req, res) => {
        console.log("Updating graph", req.body);
        try {
            const db = await getDB('data');
            // Retrieve project information
            const project = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(String(req.body.projectId)) });
            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }
            // Retrieve user information
            const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(String(req.userId)) });
            // Allow access if user is admin, owns the project, or is an editor
            if (!(user && user.role === 'admin') && (project.userId.toString() !== String(req.userId) && !project.editor.map(id => id.toString()).includes(String(req.userId)))) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
            // Update the graph object
            const updatedGraphData = {
                projectId: new mongoose.Types.ObjectId(req.body.projectId),
                chartType: req.body.chartType,
                options: req.body.options,
                elements: req.body.elements,
            };
            const result = await db.collection('graphs').findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(req.params.id) },
                { $set: updatedGraphData },
                { returnOriginal: false }
            );

            // Return the updated graph object
            res.json({success: true, ...result.value});
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

// Delete a graph by ID
router.delete('/:id', param('id').isMongoId(),
    handleValidationErrors, async (req, res) => {
        try {
            console.log("Deleting graph", req.params.id);
            const db = await getDB('data');
            const removeDoc = await db.collection('graphs').findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
            if (!removeDoc) {
                return res.status(404).json({ success: false, message: 'Graph not found' });
            }
            // Retrieve project information
            const projectId = removeDoc.projectId;

            const result = await db.collection('graphs').deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
            if (result.deletedCount === 0) {
                console.log("Graph not found");
                return res.status(404).json({ success: false, message: 'Error deleting graph' });
            }

            console.log("deleting cache entry", `project-graphs-${projectId}`);
            // Delete all cache entries
            cache.del(`project-graphs-${projectId}`);
            console.log("All cache entries deleted");

            res.json({ success: true, message: 'Graph deleted'});
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });


const setupChangeStreams = async () => {
    const db = await getDB('data');
    const collections = await db.listCollections();

    collections.forEach(({ name }) => {
        // Enable fullDocument lookup so that update events include the latest document
        const collectionChangeStream = db.collection(name).watch([], { fullDocument: 'updateLookup' });

        collectionChangeStream.on('change', (change) => {
            console.log(`Change stream event in collection ${name}: ${change.operationType}`);
            let cacheKey = null;

            // Depending on the operation type, you can access the document that was changed
            if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'replace') {
                console.log('Full document:', change.fullDocument);
                cacheKey = `project-graphs-${change.fullDocument.projectId}`;
            }

            if (cacheKey) {
                cache.del(cacheKey);
            } else {
                console.log('No cache key found for this operation');
            }
        });
    });
};

// Initialize change streams for all collections
setupChangeStreams().catch(console.error);

export default router;