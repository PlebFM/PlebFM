import { NextApiRequest, NextApiResponse } from 'next';
import Users from '../../../models/User';
import Plays, { Play } from '../../../models/Play';
import connectDB from '../../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId, limit } = req.query;

    const user = await Users.findOne({ userId });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found!' });

    const plays = await Plays.find({
      bids: { $elemMatch: { userId: 'clb9vyqmg0007ufyxb5049st0' } },
    });
    // const plays = await Plays.aggregate([
    //   {
    //     $project: {
    //       bids: {
    //         $filter: {
    //           input: '$bids',
    //           as: 'bid',
    //           cond: { $eq: ['$$bid.userId', userId] },
    //         },
    //       },
    //     },
    //   },
    // ]);
    console.log(plays);

    if (plays.length === 0)
      return res
        .status(404)
        .json({ success: false, message: 'User not found!' });
    const bids: any = [];

    plays.reduce((bids, { playId, songId, status, queueTimestamp, hostId }) =>
      play.bids.filter((bid: any) => {
        if (bid.userId === userId) {
          bids.push({ ...bid, ...playInfo });
        }
      }),
    );

    return res.status(200).json({ success: true, new: false, message: bids });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
