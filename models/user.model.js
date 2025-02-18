import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    projects: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export const createUserModel = (db) => {
    return db.model('User', userSchema);
};