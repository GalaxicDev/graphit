import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { getDB } from './connectDB.js';
import mongoose from 'mongoose';
import {verifyToken} from "./utils/jwt.js";
import { subDays, subMonths, subYears } from 'date-fns';

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
    const { collection, fields, timeframe = "Max" } = req.query;
    try {
        const db = await getDB('mqtt');

        // Create a projection object if fields are provided
        const projection = fields ? fields.split(',').reduce((acc, field) => ({ ...acc, [field]: 1 }), {}) : {};

        // Fetch the last entry to determine the end date
        const lastEntry = await db.collection(collection).findOne({}, { sort: { createdAt: -1 } });
        if (!lastEntry) {
            return res.status(404).json({ success: false, message: 'No data found' });
        }
        const endDate = new Date(lastEntry.createdAt);

        // Calculate startDate based on the timeframe
        let startDate;
        switch (timeframe) {
            case '1D':
                startDate = subDays(endDate, 1);
                break;
            case '7D':
                startDate = subDays(endDate, 7);
                break;
            case '30D':
                startDate = subDays(endDate, 30);
                break;
            case '6M':
                startDate = subMonths(endDate, 6);
                break;
            case '1Y':
                startDate = subYears(endDate, 1);
                break;
            case 'Max':
                startDate = new Date(0);
                break;
            default:
                startDate = new Date();
        }

        // Create a query object to filter by date range
        const query = {
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        };


        // Fetch data from the collection with the query and projection
        const data = await db.collection(collection).find(query, { projection }).toArray();
        console.log(data);
        res.json({ success: true, data: data });
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