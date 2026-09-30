import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureDB } from '../lib/db';
import { sendError } from '../lib/http';
const connectDB =
  (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await ensureDB();
      return await handler(req, res);
    } catch (error) {
      if (!res?.status) throw error;
      return sendError(res, error);
    }
  };
export default connectDB;
