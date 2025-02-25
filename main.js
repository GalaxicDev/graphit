import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { connectDB } from './connectDB.js';
import authRoutes from './auth.js';             // Authentication routes
import projectRoutes from './projects.js';      // Project-related routes
import graphRoutes from './graphs.js'           // Graph-related routes
import mqttRoutes from './mqtt.js'              // MQTT-related routes
import collectionRoutes from './collections.js' // Collection-related routes
import userRoutes from './users.js'             // User-related routes
import { errorHandler } from './utils/errorHandler.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());  // Secure headers

// Enable CORS with proper security settings
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 3 minutes
    max: 300, // 100 requests per IP
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);      // Authentication routes
app.use('/api/projects', projectRoutes);  // Project-related routes
app.use('/api/graphs', graphRoutes);  // Graph-related routes
app.use('/api/mqtt', mqttRoutes);  // MQTT-related routes
app.use('/api/collections', collectionRoutes);  // Collection-related routes
app.use('/api/users', userRoutes);  // User-related routes

// Centralized error handling
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
