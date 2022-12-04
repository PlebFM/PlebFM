import { ServerApiVersion } from 'mongodb';
import mongoose, { ConnectOptions } from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';

const connectDB =
    (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
        if (mongoose.connections[0].readyState) {
            // Use current db connection
            return handler(req, res);
        }
        // Use new db connection
        const connectString = process.env.MONGODB_URI;
        if (!connectString) {
            throw new Error(
                'Please define the MONGODB_URI environment variable inside .env.local'
            );
        }
        await mongoose.connect(connectString, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            serverApi: ServerApiVersion.v1,
        } as ConnectOptions);

        return handler(req, res);
    };

export default connectDB;
