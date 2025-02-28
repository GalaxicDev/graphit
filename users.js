import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { getDB } from './connectDB.js';
import bcrypt from 'bcrypt';
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
    if (!authToken) return res.status(401).json({ success: false, message: 'Token required' });
    try {
        const token = authToken.split(' ')[1];
        console.log(token)
        const decoded = verifyToken(token);
        req.userId = decoded.userId
        next();
    } catch (error) {
        res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

const createPassword = () => {
    return "TSm!" + (Math.floor(Math.random() * 9999).toString().padStart(4, '0'));
}

router.use(extractUserId);

router.post('/',
    body('name').isString().isLength({ min: 3 }),
    body('email').isEmail(),
    handleValidationErrors,
    async (req, res) => {
        const db = await getDB('data');
        const password = req.body.password || createPassword(); // If no password is provided, generate a random one
        const user = { 
            email: req.body.email,
            password: await bcrypt.hash(password, 12),
            initialPassword: password,
            name: req.body.name,
            role: req.body.role,
            lastLogin: new Date(),
            ownedCollections: [],
        };
        try {
            await db.collection('users').insertOne(user);
            console.log("Created new user with password: ", password)
            res.status(201).json({ success: true, message: 'User created successfully', password });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
});


router.get('/',
    handleValidationErrors, async (req, res) => {
        const db = await getDB('data');
        // Check if the user is an admin
        if (req.userId) {
            const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(req.userId) });
            if (user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
        };

        // Get all users
        const users = await db.collection('users').find().toArray();
        res.json(users);
    });

// get one user by its id
router.get('/:id',
    handleValidationErrors, async (req, res) => {
    const db = await getDB('data');
    const user = await db.collection('users').findOne(
        { _id: new mongoose.Types.ObjectId(req.params.id) },
        { projection: { email: 1, name: 1, lastLogin: 1 } }
    );
    
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json(user);
});

export default router;