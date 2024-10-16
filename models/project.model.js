import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    collections: { type: [mongoose.Types.ObjectId], default: [] },
    graphs: { type: [mongoose.Types.ObjectId], default: [] },
}, { timestamps: true });

export const createProjectModel = (db) => {
    return db.model('projects', projectSchema);
};