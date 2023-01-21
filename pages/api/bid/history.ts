import { NextApiRequest, NextApiResponse } from 'next';
import Plays from '../../../models/Play';
import connectDB from '../../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, limit } = req.query;

    // const user = await Users.findOne({ userId });
    // if (!user)
    //     return res
    //         .status(404)
    //         .json({ success: false, message: 'User not found!' });

    const mongooseFilter = {
      bids: { $elemMatch: { 'user.userId': userId } },
      options: {},
    };
    if (limit && limit !== '')
      mongooseFilter.options = {
        limit: limit,
      };

    const plays = await Plays.find(mongooseFilter);
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
