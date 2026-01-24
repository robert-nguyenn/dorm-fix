import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existing = await User.findOne({ email: 'test@dormfix.com' });
    if (existing) {
      console.log('✅ Test user already exists!');
      console.log('Email: test@dormfix.com');
      console.log('Password: password123');
      process.exit(0);
    }

    // Create test user
    const user = new User({
      name: 'Test User',
      email: 'test@dormfix.com',
      password: 'password123',
      confirmPassword: 'password123',
      building: 'Pearsons Hall',
      room: '101'
    });

    await user.save();

    console.log('✅ Test user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email: test@dormfix.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
