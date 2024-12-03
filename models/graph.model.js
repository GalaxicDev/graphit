import mongoose from "mongoose";

const graphSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    projectId: { type: mongoose.Types.ObjectId, required: true },
    options: { type: Object, required: true },
    elements: { type: Array, required: true },
    conditionalParams: { type: Object, required: true },
}, { timestamps: true });

export const createGraphModel = (db) => {
    return db.model('graphs', graphSchema);
};