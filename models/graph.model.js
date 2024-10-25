import mongoose from "mongoose";

const graphSchema = new mongoose.Schema({
    projectId: { type: mongoose.Types.ObjectId, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    xField: { type: String, required: true },
    xCollection: { type: mongoose.Types.ObjectId, required: true },
    yField: { type: String, required: true },
    yCollection: { type: mongoose.Types.ObjectId, required: true }
}, { timestamps: true });

export const createProjectModel = (db) => {
    return db.model('graphs', graphSchema);
};