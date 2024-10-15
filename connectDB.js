import mongoose from 'mongoose';

let cachedConnection = null;

export const connectDB = async () => {
    if (cachedConnection) return cachedConnection;

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        cachedConnection = conn.connection;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
    } catch (e) {
        console.log("Error connecting to MongoDB:", e.message);
        process.exit(1);
    }
};

export const getDB = async (dbName) => {
    if (!cachedConnection) await connectDB();
    return cachedConnection.useDb(dbName);
};

export default connectDB;
