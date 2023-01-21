import { NextApiRequest, NextApiResponse } from 'next';
import Users from '../../../models/User';
import Plays, { Play } from '../../../models/Play';
import connectDB from '../../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET')
      return res.status(403).json({ success: false, error: 'Forbidden!' });

    const { userId, limit } = req.query;

    console.log('request.query', req.query);

    const user = await Users.findOne({ userId: userId });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found!' });

    const plays = await Plays.find({
      filter: { 'bids.userId': { $eq: userId } },
      options: { limit: limit ?? 5 },
    });

    if (plays.length === 0)
      return res
        .status(404)
        .json({ success: false, message: 'No bids found!' });

    const bids = plays.filter((play: Play) =>
      play.bids.filter((bid: any) => {
        return bid.userId === userId;
      }),
    );

    return res.status(200).json({ success: true, new: false, message: bids });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
