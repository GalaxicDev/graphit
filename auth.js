import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getDB } from './connectDB.js';
import { createUserModel } from './models/user.model.js';
import { generateToken, verifyToken } from './utils/jwt.js';

const router = express.Router();

// Login Route
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    console.log("login", email, password);

    try {
        const db = await getDB('data');
        const User = createUserModel(db);

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = generateToken(user._id);
        console.log("login token", token);
        const { password: userPassword, initialPassword, __v, ...userWithoutSensitiveData } = user.toObject(); // Remove sensitive data
        res.json({ success: true, message: 'Login successful', token, user: userWithoutSensitiveData });
    } catch (error) {
        next(error); // Pass the error to centralized error handler
    }
});

// Verify token Route
router.get('/verify', async (req, res, next) => {
    const authToken = req.headers['authorization'];
    console.log("verify", authToken);
    if (!authToken) return res.status(401).json({ success: false, message: 'Token required' });

    try {
        const token = authToken.split(' ')[1];
        const decoded = verifyToken(token);

        const db = await getDB('data');
        const User = createUserModel(db);
        const user = await User.findById(decoded.userId, { password: 0, initialPassword: 0, __v: 0 }); // Remove sensitive data

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, userId: decoded.userId, user: user });
    } catch (error) {
        next(error); // Pass the error to centralized error handler
    }
});

export default router;
