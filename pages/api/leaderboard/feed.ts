import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import Feed from '../../../models/Feed';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { hostId, timestamp } = req.query;
    const updates = await Feed.find({
      hostId: hostId,
      timestamp: { $gte: '2023-01-07T20:34:32.388Z' },
    });
    if (updates.length === 0)
      return res.status(404).json({
        success: false,
        message: `No Updates found for host ${hostId}, timestamps >= ${timestamp}!`,
      });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
