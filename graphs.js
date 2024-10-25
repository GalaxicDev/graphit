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


router.get('/:projectId', async (req, res) => {
    try {

        const db = await getDB('data');
        const graphs = await db.collection('graphs').aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.userId), projectId: new mongoose.Types.ObjectId(req.params.projectId) } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'project'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            }
        ]).toArray();

        const graphs2 = await db.collection('graphs').find({ userId: new mongoose.Types.ObjectId(req.userId), projectId: new mongoose.Types.ObjectId(req.params.projectId) }).toArray();

        console.log('Graphs:', graphs2);
        res.json(graphs2);
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
    body('name').isString().isLength({ min: 3 }),
    handleValidationErrors, async (req, res) => {
        try {
            const db = await getDB('data');
            const newGraphData = {
                userId: new mongoose.Types.ObjectId(req.userId),
                projectId: new mongoose.Types.ObjectId(req.body.projectId),
                name: req.body.name,
                type: req.body.type,
                xField: req.body.xField,
                xCollection: req.body.xCollection,
                yField: req.body.yField,
                yCollection: req.body.yCollection,
            };
            const result = await db.collection('graphs').insertOne(newGraphData);
            console.log('result:', result);
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

