import mongoose from 'mongoose';

/**
 * Connect to MongoDB using MONGODB_URI from environment.
 */
export async function connectDB(uri) {
  const connectionString = uri || process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(connectionString);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
