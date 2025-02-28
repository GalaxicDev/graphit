// Description: This file is responsible for connecting to the MQTT broker and MongoDB database.
// Version: 1.6.1
// Date: 28-2-2025
// Last Change: Refactored message handling and added webhook support
//

require('dotenv').config();
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const axios = require('axios');

// MongoDB connection
const dbURI = process.env.MONGO_URI;
const connectWithRetry = () => {
  mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
  });
};

connectWithRetry();

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Reconnecting...');
  connectWithRetry();
});

const getModelForTopic = (topic, message) => {
  let collectionName = topic.replace(/\//g, '_'); // Replace '/' in topic with '_'
  collectionName = collectionName.replace('db_', '');

  // Create schema definition based on message structure
  const schemaDefinition = {};
  for (const key in message) {
    if (typeof message[key] === 'string') {
      schemaDefinition[key] = String;
    } else if (typeof message[key] === 'number') {
      schemaDefinition[key] = Number;
    } else if (typeof message[key] === 'boolean') {
      schemaDefinition[key] = Boolean;
    } else if (Array.isArray(message[key])) {
      schemaDefinition[key] = [mongoose.Schema.Types.Mixed];
    } else if (typeof message[key] === 'object') {
      schemaDefinition[key] = mongoose.Schema.Types.Mixed;
    } else {
      schemaDefinition[key] = mongoose.Schema.Types.Mixed;
    }
  }

  const schema = new mongoose.Schema(schemaDefinition, { timestamps: true, collection: collectionName });

  // Delete the existing model if it exists
  if (mongoose.models[collectionName]) {
    delete mongoose.models[collectionName];
  }

  // Create a new model
  return mongoose.model(collectionName, schema);
};

// Handle registration messages
const handleRegistrationMessage = async (jsonMessage) => {
  const { deviceId, user } = jsonMessage;
  const User = mongoose.model('users', new mongoose.Schema({
    name: String,
    ownedCollections: [String]
  }));

  User.findOneAndUpdate(
    { name: user },
    { $addToSet: { ownedCollections: deviceId } },
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        console.error('Error updating user document:', err);
      } else {
        console.log(`Device ID "${deviceId}" added to user "${user}"`);
      }
    }
  );

  // Send webhook to Next.js website
  try {
    await axios.post('https://your-nextjs-website.com/api/webhook', {
      event: 'registration',
      data: jsonMessage
    });
    console.log('Webhook sent for registration');
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
};

// Handle database messages
const handleDatabaseMessage = async (topic, jsonMessage) => {
  // Get or create the model for the current topic
  const Model = getModelForTopic(topic, jsonMessage);

  // Save the message to the MongoDB collection for this topic
  const newMessage = new Model(jsonMessage);
  await newMessage.save();
  console.log(`Message saved to collection for topic "${topic}":`, jsonMessage);

  // Send webhook to Next.js website
  try {
    await axios.post('https://your-nextjs-website.com/api/webhook', {
      event: 'database',
      topic,
      data: jsonMessage
    });
    console.log('Webhook sent for database message');
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
};

// Connect to the MQTT broker
const options = {
  protocol: 'mqtts',
  host: '138.199.200.175',
  port: 1883,
};

const client = mqtt.connect(options);

// Handle MQTT connection
client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Subscribe to all topics
  client.subscribe('#', (err) => {
    if (err) {
      console.log('Subscription error:', err);
    } else {
      console.log('Subscribed to topic: #');
    }
  });
});

// handle reconnection and disconnection
client.on('reconnect', () => {
  console.log('Reconnecting to MQTT broker...');
});

client.on('close', () => {
  console.log('MQTT connection closed! Attempting to reconnect...');
});

// Handle incoming messages
client.on('message', async (topic, message) => {
  try {
    // Parse the JSON message
    const jsonMessage = JSON.parse(message.toString());
    console.log(`Message received on topic "${topic}":`, jsonMessage);

    if (topic === 'registration' && jsonMessage.deviceId && jsonMessage.user) {
      await handleRegistrationMessage(jsonMessage);
    } else if (topic.startsWith('db/')) {
      await handleDatabaseMessage(topic, jsonMessage);
    }
  } catch (err) {
    console.error('Failed to parse JSON message:', err);
  }
});

// Handle connection errors
client.on('error', (error) => {
  console.error('Connection error:', error);
  client.end();
});