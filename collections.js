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

const getCollections = async (dbName, userId) => {
    const db = await getDB(dbName);
    const userDb = await getDB("data");
    const user = await userDb.collection("users").findOne({ _id: new mongoose.Types.ObjectId(userId) });
    
    if(user.role === 'admin') {
        console.log("admin");
        const ownedCollections = await db.db.listCollections().toArray();
        console.log(ownedCollections);
        const collectionData = await Promise.all(ownedCollections.map(async (collection) => {
            return {
                name: collection.name
            };
        }));
        return collectionData;
    } else if (!user || !user.ownedCollections) {
        return [];
    }

    const collections = await db.db.listCollections().toArray();
    const ownedCollections = collections.filter(collection => user.ownedCollections.includes(collection.name));

    const collectionData = await Promise.all(ownedCollections.map(async (collection) => {
        return {
            name: collection.name
        };
    }));
    return collectionData;
};

const getDocuments = async (collectionName, page, pageSize) => {
    const db = await getDB("mqtt");
    const coll = db.collection(collectionName);
    const totalDocuments = await coll.countDocuments();
    const documents = await coll.find()
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();
    return { documents, totalDocuments };
};

// GET /api/collections
router.get('/', async (req, res) => {
    try {
        const collections = await getCollections("mqtt", req.userId);
        res.json(collections);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:collection', async (req, res) => {
    const { collection } = req.params;
    const { page = 1, pageSize = 10 } = req.query; // Default to page 1 and pageSize 10 if not provided

    try {
        const { documents, totalDocuments } = await getDocuments(collection, parseInt(page), parseInt(pageSize));
        res.json({ documents, totalDocuments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch collection content', error: error.message });
    }
});

router.get('/:collection', async (req, res) => {
    const { collection } = req.params;
    const { page = 1, pageSize = 10 } = req.query; // Default to page 1 and pageSize 10 if not provided

    try {
        const { documents, totalDocuments } = await getDocuments(collection, parseInt(page), parseInt(pageSize));
        res.json({ documents, totalDocuments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch collection content', error: error.message });
    }
});

export default router;