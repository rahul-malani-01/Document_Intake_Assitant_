import mongoose from 'mongoose';
import { ENV } from './env.js';

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Database] MongoDB connected successfully');
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    throw error;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}