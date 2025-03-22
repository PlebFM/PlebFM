import { ServerApiVersion } from 'mongodb';
import mongoose, { ConnectOptions } from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

// Type for Pages API routes
export const connectDB =
  (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    if (mongoose.connections[0].readyState) {
      // Use current db connection
      return handler(req, res);
    }
    // Use new db connection
    const connectString = process.env.MONGODB_URI;
    if (!connectString) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local',
      );
    }
    await mongoose.connect(connectString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      serverApi: ServerApiVersion.v1,
    } as ConnectOptions);

    return handler(req, res);
  };

// Helper function to establish DB connection
async function dbConnect() {
  if (mongoose.connections[0].readyState) {
    // Use current db connection
    return;
  }
  // Use new db connection
  const connectString = process.env.MONGODB_URI;
  if (!connectString) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local',
    );
  }
  await mongoose.connect(connectString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    serverApi: ServerApiVersion.v1,
  } as ConnectOptions);
}

// Helper for App Router route handlers
export function withMongo(handler: Function) {
  return async function mongoWrappedHandler(...args: any[]) {
    await dbConnect();
    return handler(...args);
  };
}

export default connectDB;
