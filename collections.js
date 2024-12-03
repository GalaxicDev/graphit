import express from 'express';
import { body, param, validationResult } from 'express-validator';
import {connectDB, getDB} from './connectDB.js';
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


// Utility function to format size
const formatSize = (size) => {
    const units = ['B', 'kiB', 'MiB', 'GiB'];
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index++;
    }
    return `${size.toFixed(2)} ${units[index]}`;
};

const getCollectionData = async (dbName) => {
    const db = await getDB(dbName);
    const collections = await db.db.listCollections().toArray();
    const collectionData = await Promise.all(collections.map(async (collection) => {
        //CAN'T GET STATS OF COLLECTIONS PLS FIX
        //const collectionObj = db.collection(collection.name);
        //const stats = await collectionObj.stats();
        return {
            name: collection.name,
            //size: formatSize(stats.size),
            //count: stats.count,
        };
    }));
    return collectionData;
};


const getCollectionContent = async (dbName, collectionName, page = 1, pageSize = 10) => {
    if (collectionName === 'users') {
        throw new Error('Access to the users collection is restricted');
    }

    try {
        await connectDB();
        const db = await getDB(dbName);
        const coll = db.collection(collectionName);
        const skip = (page - 1) * pageSize;
        const totalDocuments = await coll.countDocuments(); // Get total document count
        const data = await coll.find({}).skip(skip).limit(pageSize).toArray(); // Ensure find parameter is an object

        // Convert ObjectIDs to strings
        const convertedData = data.map(doc => ({
            ...doc,
            _id: doc._id.toString()
        }));

        return { documents: convertedData, totalDocuments }; // Return both documents and total count
    } catch (error) {
        throw new Error('Failed to fetch collection content');
    }
};

// GET /api/collections
router.get('/', async (req, res) => {
    try {
        const collectionData = await getCollectionData("mqtt");
        res.json(collectionData);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;