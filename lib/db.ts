import mongoose from 'mongoose';
let connecting: Promise<typeof mongoose> | undefined;
export async function ensureDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  connecting ??= mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    .catch(error => {
      connecting = undefined;
      throw error;
    });
  await connecting;
}
