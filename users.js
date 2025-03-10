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
    body('username').isString().isLength({ min: 3 }),
    body('email').isEmail(),
    handleValidationErrors,
    async (req, res) => {
        const db = await getDB('data');
        
        // Check if the user is admin
        const requestingUser = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(req.userId) });
        if (requestingUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const password = req.body.password || createPassword(); // If no password is provided, generate a random one
        const user = { 
            email: req.body.email,
            password: await bcrypt.hash(password, 12),
            initialPassword: password,
            name: req.body.username,
            role: req.body.role,
            lastLogin: new Date(),
            ownedCollections: [],
        };
        try {
            await db.collection('users').insertOne(user);
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

router.get('/',
    handleValidationErrors, async (req, res) => {
        const db = await getDB('data');
        if (req.userId) {
            const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(req.userId) });
            if (user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
        };
        const users = await db.collection('users').find().toArray();
        res.json(users);
    });

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

router.put('/change-password',
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    handleValidationErrors, async (req, res) => {
        const db = await getDB('data');
        const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(req.userId) });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log(req.body.password)
        const password = await bcrypt.hash(req.body.password, 12);
        await db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(req.userId) },
            { $set: { password } }
        );
        res.json({ message: 'Password updated successfully' });
    });
export default router;