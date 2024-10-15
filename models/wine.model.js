import mongoose from "mongoose";

// Wine Schema
const wineSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    description: { type: String },
    region: { type: String, index: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    price: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
    purchaseDate: { type: Date },
    optimalDrinkingDate: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to user
}, { timestamps: true });

export const Wine = mongoose.model('Wine', wineSchema);