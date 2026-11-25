import mongoose from 'mongoose';
import { env } from './env.js';

const STATE_LABELS = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export async function connectDatabase() {
  if (!env.mongodbUri) {
    throw new Error(
      'MONGODB_URI is not set. Add your MongoDB Atlas connection string to backend/.env.'
    );
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose.connection;
}

export function getDatabaseStatus() {
  const readyState = mongoose.connection.readyState;
  return {
    connected: readyState === 1,
    readyState,
    stateLabel: STATE_LABELS[readyState] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}
