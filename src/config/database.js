import mongoose from 'mongoose';
import { config } from './index.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error(`\nMongoDB Connection Failed: ${error.message}`);


    throw error;
  }
};
