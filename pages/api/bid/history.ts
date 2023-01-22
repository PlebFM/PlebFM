import { NextApiRequest, NextApiResponse } from 'next';
import Plays from '../../../models/Play';
import connectDB from '../../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET')
      return res.status(403).json({ success: false, error: 'Forbidden!' });

    const { userId, limit } = req.query;
    const queryArgs = {
      bids: { $elemMatch: { 'user.userId': userId } },
      options: {},
    };
    if (limit && limit !== '')
      queryArgs.options = {
        limit: Number(limit),
      };

    const plays = await Plays.find(queryArgs);
    if (plays.length === 0)
      return res
        .status(404)
        .json({ success: false, message: 'No plays found for user!' });

    return res.status(200).json({ success: true, new: false, message: plays });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
