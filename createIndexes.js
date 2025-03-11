// TODO: create indexes to reduce query time

import { getDB } from './connectDB.js';

const createIndexes = async () => {
    const db = await getDB('mqtt');

    // List of collections to create indexes on
    const collections = await db.listCollections().toArray();

    for (const { name } of collections) {
        console.log(`Creating indexes for collection: ${name}`);

        // Create an index on the createdAt field
        await db.collection(name).createIndex({ createdAt: 1 });

        // Create indexes on fields specified in conditionalParams
        // Replace 'field1', 'field2', etc. with actual field names
        await db.collection(name).createIndex({ field1: 1 });
        await db.collection(name).createIndex({ field2: 1 });
        // Add more indexes as needed
    }

    console.log('Indexes created successfully');
};

const removeIndexes = async () => {
    const db = await getDB('mqtt');

    // List of collections to remove indexes from
    const collections = await db.listCollections().toArray();

    for (const { name } of collections) {
        console.log(`Removing indexes for collection: ${name}`);

        // Remove an index on the createdAt field
        await db.collection(name).dropIndex({ createdAt: 1 });

        // Remove indexes on fields specified in conditionalParams
        // Replace 'field1', 'field2', etc. with actual field names
        await db.collection(name).dropIndex({ field1: 1 });
        await db.collection(name).dropIndex({ field2: 1 });
        // Remove more indexes as needed
    }

    console.log('Indexes removed successfully');
};

// Uncomment the function you want to run
createIndexes().catch(console.error);
// removeIndexes().catch(console.error);