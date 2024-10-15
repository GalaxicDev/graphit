import mongoose from "mongoose";

// Subcategory Schema
const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },  // Reference to category
    wines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wine' }],  // Array of wine references
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // Reference to user
});

// Category Schema
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],  // Array of subcategory references
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // Reference to user
});

// Models for export
export const Category = mongoose.model('Category', categorySchema);
export const Subcategory = mongoose.model('Subcategory', subcategorySchema);