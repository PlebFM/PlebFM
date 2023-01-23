import { NextApiRequest, NextApiResponse } from 'next';
import Plays from '../../../models/Play';
import connectDB from '../../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET')
      return res.status(403).json({ success: false, error: 'Forbidden!' });

    const { userId, limit } = req.query;

    const limitCast = Number(limit);
    const queryArgs: any = {
      bids: { $elemMatch: { 'user.userId': userId } },
    };
    if (limit !== '' && !isNaN(limitCast)) {
      queryArgs['options'] = {
        limit: limitCast,
      };
    }

    const plays = await Plays.find(queryArgs);
    if (plays.length === 0)
      return res
        .status(404)
        .json({ success: false, message: 'No plays found for user!' });

    return res.status(200).json({ success: true, message: plays });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
