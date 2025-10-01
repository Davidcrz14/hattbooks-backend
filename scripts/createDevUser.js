import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
//scrip para crear un usuario de desarrollo en la base de datos
dotenv.config();

const createDevUser = async () => {
  try {
    console.log(' Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB');

    const existingUser = await User.findOne({ auth0Id: 'auth0|dev-user-123' });

    if (existingUser) {
      console.log('  Dev user already exists:');
      console.log({
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        displayName: existingUser.displayName,
      });
      await mongoose.connection.close();
      process.exit(0);
    }

    const devUser = await User.create({
      auth0Id: 'auth0|dev-user-123',
      email: 'dev@hattbooks.com',
      username: 'devuser',
      displayName: 'Dev User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
      bio: 'Development test user for HattBooks',
      karma: 100,
      reputation: 50,
      level: 5,
    });

    console.log('\n Dev user created successfully!\n');
    console.log('User Details:');
    console.log({
      id: devUser._id,
      auth0Id: devUser.auth0Id,
      username: devUser.username,
      email: devUser.email,
      displayName: devUser.displayName,
      karma: devUser.karma,
      level: devUser.level,
    });

    console.log('\n Use this auth0Id for testing:');
    console.log('auth0|dev-user-123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(' Error creating dev user:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createDevUser();
