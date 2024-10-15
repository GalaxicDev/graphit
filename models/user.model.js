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
    },
    name: {
        type: String,
        required: true,
    },
    macAddresses: [{
        macAddress: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    }],
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
}, { timestamps: true });

export const createUserModel = (db) => {
    return db.model('User', userSchema);
};