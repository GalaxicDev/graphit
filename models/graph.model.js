import mongoose from "mongoose";

const graphSchema = new mongoose.Schema({
    projectId: { type: mongoose.Types.ObjectId, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    collection: { type: mongoose.Types.ObjectId, required: true },
    xField: { type: String, required: true },
    yField: { type: String, required: true },
}, { timestamps: true });

export const createProjectModel = (db) => {
    return db.model('graphs', graphSchema);
};