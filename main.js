import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { connectDB } from './connectDB.js';
import authRoutes from './auth.js';  // Authentication routes
import wineRoutes from './wines.js';  // Wine-related routes
import projectRoutes from './projects.js';  // Project-related routes
import { errorHandler } from './utils/errorHandler.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());  // Secure headers

// Enable CORS with proper security settings
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);      // Authentication routes
app.use('/api/wines', wineRoutes);     // Wine-related routes
app.use('/api/projects', projectRoutes);  // Project-related routes

// Centralized error handling
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
