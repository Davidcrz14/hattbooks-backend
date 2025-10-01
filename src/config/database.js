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
    console.error(`\nSolutions:`);
    console.error(`   1. Install MongoDB locally: https://www.mongodb.com/try/download/community`);
    console.error(`   2. Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas`);
    console.error(`   3. Start local MongoDB: Run 'mongod' in another terminal`);
    console.error(`\nServer will continue WITHOUT database (some features won't work)\n`);

    if (config.env === 'production') {
      process.exit(1);
    }
  }
};
