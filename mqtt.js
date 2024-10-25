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
//router.use(extractUserId);

router.get('/data', async (req, res) => {
    const { collections, fields } = req.query;

    // Ensure collections and fields exist and are arrays
    if (!Array.isArray(collections) || !Array.isArray(fields)) {
        return res.status(400).json({ success: false, message: 'Collections and fields must be arrays' });
    }

    try {
        const db = await getDB('mqtt');
        const results = {};

        for (const collectionName of collections) {
            // Create a projection object for MongoDB, setting each requested field to 1
            const projection = fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});

            // Query the collection for the specified fields
            const collectionData = await db.collection(collectionName).find({}, { projection }).toArray();

            results[collectionName] = collectionData;
        }

        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//////// This is still the code for deleting a graph, not an entry of a mqtt. ////////

// router.delete('/:id', param('id').isMongoId(),
//     handleValidationErrors, async (req, res) => {
//     try {
//         const db = await getDB('mqtt');
//         const graph = await db.collection('graphs').findOneAndDelete({ _id: new mongoose.Types.ObjectId(req.params.id) });
//         if (!graph.value) {
//             return res.status(404).json({ success: false, message: 'Graph not found' });
//         }
//         res.json(graph.value);
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// });

export default router;