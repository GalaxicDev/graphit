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
router.use(extractUserId);


router.get('/data', async (req, res) => {
    const { collections, fields, timeframe, from, to } = req.query;
    if (!collections || !fields) {
        return res.status(400).json({ success: false, message: 'Collections and fields parameters are required' });
    }

    try {
        const db = await getDB('mqtt');
        const collectionList = collections.split(',');
        const fieldList = fields.split(',');

        let data = [];

        for (const collection of collectionList) {
            let query = {};
            let projection = fieldList.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});

            if (timeframe) {
                const lastEntry = await db.collection(collection).findOne({}, { sort: { createdAt: -1 } });
                if (!lastEntry) continue;
                const endDate = new Date(lastEntry.createdAt);

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

                query = {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                };
            } else if (from && to) {
                query = {
                    createdAt: {
                        $gte: new Date(from),
                        $lte: new Date(to)
                    }
                };
            } else {
                return res.status(400).json({ success: false, message: 'Invalid query parameters' });
            }

            const collectionData = await db.collection(collection).find(query, { projection }).toArray();
            data = data.concat(collectionData);
        }

        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/availableKeys', async (req, res) => {
    const { collection } = req.query;
    try {
        const db = await getDB('mqtt');

        // Fetch all documents from the collection
        const allDocuments = await db.collection(collection).find({}).toArray();
        const availableKeys = new Set();
        allDocuments.forEach(doc => {
            Object.keys(doc).forEach(key => availableKeys.add(key));
        });

        res.json({ success: true, availableKeys: Array.from(availableKeys) });
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