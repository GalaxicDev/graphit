import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getDB } from './connectDB.js';
import { createUserModel } from './models/user.model.js';
import { generateToken, verifyToken } from './utils/jwt.js';

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res, next) => {
    const { email, password, name } = req.body;

    try {
        const db = await getDB('data');
        const User = createUserModel(db);

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(16).toString('hex');

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        await newUser.save();

        const token = generateToken(newUser._id);
        res.status(201).json({ success: true, message: 'User registered successfully', token });
    } catch (error) {
        next(error); // Pass the error to centralized error handler
    }
});

// Login Route
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const db = await getDB('data');
        const User = createUserModel(db);

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = generateToken(user._id);
        res.json({ success: true, message: 'Login successful', token });
    } catch (error) {
        next(error); // Pass the error to centralized error handler
    }
});

// Verify token Route
router.get('/verify', async (req, res, next) => {
    const authToken = req.headers['authorization'];
    if (!authToken) return res.status(403).json({ success: false, message: 'Token required' });

    try {
        const token = authToken.split(' ')[1];
        const decoded = verifyToken(token);

        const db = await getDB('data');
        const User = createUserModel(db);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, userId: decoded.userId });
    } catch (error) {
        next(error); // Pass the error to centralized error handler
    }
});

export default router;
