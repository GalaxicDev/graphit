import express from 'express';
import { body, param, validationResult, query } from 'express-validator';
import { getDB } from './connectDB.js';
import mongoose from 'mongoose';
import {verifyToken} from "./utils/jwt.js";
import { subDays, subMonths, subYears } from 'date-fns';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 * 60 }); // 1 hour cache
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


router.get('/data',
    [
        query('collections').isString().withMessage('Collections parameter is required'),
        query('fields').isString().withMessage('Fields parameter is required'),
        query('timeframe').optional().isString(),
        query('from').optional().isISO8601(),
        query('to').optional().isISO8601(),
        handleValidationErrors
    ], async (req, res) => {
    const { collections, fields, timeframe, from, to } = req.query;
    const conditionalParams = req.query.conditionalParams;

    console.log("starting to fetch data", req.query);

    if (!collections || !fields) {
        return res.status(400).json({ success: false, message: 'Collections and fields parameters are required' });
    }

    const cacheKey = JSON.stringify(req.query);
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        console.log("returning cached data");
        return res.json({ success: true, data: cachedData });
    }

    try {
        const db = await getDB('mqtt');
        const collectionList = collections.split(',');
        const fieldList = fields.split(',').map(f => f.trim()).filter(f => f);
        if (fieldList.length === 0) {
            return res.status(400).json({success: false, message: 'No valid fields provided'});
        }

        let data = [];

        for (const collection of collectionList) {
            let query = {};
            let projection = fieldList.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});

            // Handle timeframe filtering
            if (timeframe) {
                const lastEntry = await db.collection(collection).findOne({}, { sort: { createdAt: -1 } });
                if (!lastEntry) continue;

                const endDate = new Date(lastEntry.createdAt);
                let startDate;

                switch (timeframe) {
                    case '1D': startDate = subDays(endDate, 1); break;
                    case '7D': startDate = subDays(endDate, 7); break;
                    case '30D': startDate = subDays(endDate, 30); break;
                    case '6M': startDate = subMonths(endDate, 6); break;
                    case '1Y': startDate = subYears(endDate, 1); break;
                    case 'Max': startDate = new Date(0); break;
                    default: startDate = new Date();
                }

                query.createdAt = { $gte: startDate, $lte: endDate };
            } else if (from && to) {
                query.createdAt = { $gte: new Date(from), $lte: new Date(to) };
            }

            // Ensure conditionalParams is an array and iterate over it
            if (Array.isArray(conditionalParams)) {
                for (const param of conditionalParams) {
                    const { field, operator, value } = param;

                    if (!field || !operator || value === undefined) {
                        return res.status(400).json({
                            success: false,
                            message: 'Each conditionalParam must include a field, operator, and value',
                        });
                    }

                    if (!query[field]) query[field] = {};

                    // Refined type detection
                    let parsedValue;
                    if (typeof value === 'string') {
                        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/.test(value)) {
                            parsedValue = new Date(value); // ISO-8601 date
                        } else if (!isNaN(value)) {
                            parsedValue = parseFloat(value); // Numeric string
                        } else {
                            parsedValue = value; // Default string
                        }
                    } else {
                        parsedValue = value; // Preserve original type
                    }

                    switch (operator) {
                        case 'equals':
                            query[field] = parsedValue;
                            break;
                        case 'not equals':
                            query[field] = { $ne: parsedValue };
                            break;
                        case 'greater than':
                            query[field] = { $gt: parsedValue };
                            break;
                        case 'less than':
                            query[field] = { $lt: parsedValue };
                            break;
                        case 'greater than or equal to':
                            query[field] = { $gte: parsedValue };
                            break;
                        case 'less than or equal to':
                            query[field] = { $lte: parsedValue };
                            break;
                        default:
                            return res.status(400).json({
                                success: false,
                                message: `Unsupported operator: ${operator}`,
                            });
                    }
                }
            }

            console.log("query", query);

            const collectionData = await db.collection(collection).find(query, { projection }).toArray();
            data = data.concat(collectionData);
        }

        cache.set(cacheKey, data); // Cache the data for future requests

        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.get('/availableKeys', async (req, res) => {
    const { collection } = req.query;

    if (!collection) {
        return res.status(400).json({ success: false, message: 'Collection parameter is required' });
    }

    // add caching to prevent multiple requests
    const cacheKey = `availableKeys-${collection}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json({ success: true, availableKeys: cachedData });
    }

    try {
        const db = await getDB('mqtt');

        // Fetch all documents from the collection
        const allDocuments = await db.collection(collection).find({}).toArray();
        const availableKeys = new Set();
        allDocuments.forEach(doc => {
            Object.keys(doc).forEach(key => availableKeys.add(key));
        });

        cache.set(cacheKey, Array.from(availableKeys)); // Cache the data for future requests

        res.json({ success: true, availableKeys: Array.from(availableKeys) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// cache listener, remove cache when new data is added, only remove cache for the specific collection (availableKeys and mqttData)
// we use changeStream to listen to changes in the collection and remove the cache
const setupChangeStreams = async () => {
    const db = await getDB('mqtt');
    const collections = await db.listCollections();

    collections.forEach(({ name }) => {
        const collectionChangeStream = db.collection(name).watch();

        collectionChangeStream.on('change', (change) => {
            console.log(`Change stream event in collection ${name}: ${change.operationType}`);
            cache.del(`availableKeys-${name}`);
            cache.keys((err, keys) => {
                if (err) {
                    console.error(err);
                } else {
                    keys.forEach(key => {
                        try {
                            const parsedKey = JSON.parse(key);
                            if (parsedKey.collections && parsedKey.collections.includes(name)) {
                                cache.del(key);
                                console.log(`Removed cache for key: ${key}`);
                            }
                        } catch (e) {
                            console.error(`Error parsing cache key: ${key}`, e);
                        }
                    });
                }
            });
        });
    });
};

// Initialize change streams for all collections
setupChangeStreams().catch(console.error);


export default router;