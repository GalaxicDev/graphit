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
    return Math.floor(Math.random() * 9999).toString().padStart(4, '0');;
}
router.use(extractUserId);

router.post('/',
    body('name').isString().isLength({ min: 3 }),
    body('email').isEmail(),
    handleValidationErrors,
    async (req, res) => {
        const db = await getDB('users');
        const user = { 
            email: req.body.email,
            name: req.body.name,
            initialPassword: createPassword(),
            role: 'user',
            ownedCollections: [],
        };
        try {
            await user.save();
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
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

export default router;