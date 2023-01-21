import { NextApiRequest, NextApiResponse } from 'next';
import Users from '../../../models/User';
import Plays, { Play } from '../../../models/Play';
import connectDB from '../../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;

    const user = await Users.findOne({ userId });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found!' });

    const plays = await Plays.find({ 'bids.userId': userId });
    if (plays.length === 0)
      return res
        .status(404)
        .json({ success: false, message: 'User not found!' });

    const bids = plays.filter((play: Play) =>
      play.bids.filter((bid: any) => bid.user.userId === userId),
    );

    return res.status(200).json({ success: true, new: false, message: bids });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
