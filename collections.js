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
        const collectionData = await Promise.all(ownedCollections.map(async (collection) => {
            const metadata = await userDb.collection("collection_metadata").findOne({ collection: collection.name });
            return {
                name: collection.name,
                displayName: metadata ? metadata.displayName : collection.name
            };
        }));
        return collectionData;
    } else if (!user || !user.ownedCollections) {
        return [];
    }

    const collections = await db.db.listCollections().toArray();
    const ownedCollections = collections.filter(collection => user.ownedCollections.includes(collection.name));

    // also fetch the display name for each collection
    const collectionData = await Promise.all(ownedCollections.map(async (collection) => {
        const metadata = await userDb.collection("collection_metadata").findOne({ collection: collection.name });
        return {
            name: collection.name,
            displayName: metadata ? metadata.displayName : collection.name
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

// endpoint to update/or add a displayname to a collection
router.put('/:collection',
    body('displayName').isString().isLength({ min: 3 }),
    handleValidationErrors, async (req, res) => {
        const { collection } = req.params;
        const { displayName } = req.body;

        try {
            const db = await getDB("data");
            const coll = db.collection("collection_metadata");
            const result = await coll.updateOne(
                { collection }, // Filter by collection name
                { $set: { collection, displayName } }, // Update or set the displayName
                { upsert: true } // Insert a new document if no matching document is found
            );

            if (result.upsertedCount > 0) {
                res.status(201).json({ success: true, message: 'Collection created successfully' });
            } else if (result.modifiedCount > 0) {
                res.json({ success: true, message: 'Collection updated successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Collection not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
});

router.delete('/:collection/:id', async (req, res) => {
    const { collection, id } = req.params;

    try {

        // check if the user is allowed to delete the document (if the collection is owned by the user or if the user is an admin)
        const userDb = await getDB("data");
        const user = await userDb.collection("users").findOne({ _id: new mongoose.Types.ObjectId(req.userId) });
        if (!user) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (user.role !== 'admin' && (!user.ownedCollections || !user.ownedCollections.includes(collection))) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const db = await getDB("mqtt");
        const coll = db.collection(collection);
        const result = await coll.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }
        res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:collection/export', async (req, res) => {
    const { collection } = req.params;

    try {
        const db = await getDB("mqtt");
        const coll = db.collection(collection);
        const documents = await coll.find().toArray();
        const totalDocuments = documents.length;
        res.json({ documents, totalDocuments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch collection content', error: error.message });
    }
});

export default router;