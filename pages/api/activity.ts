import { NextApiRequest, NextApiResponse } from 'next';
import Plays from '../../models/Play';
import connectDB from '../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { hostShortName } = req.query;
    const time: any = req.query.time ?? 0;

    if (!time && !hostShortName)
      return res.status(400).json({
        success: false,
        error: 'Missing query params hostShortName and/or time!',
      });

    if (req.method !== 'GET')
      return res.status(403).json({ success: false, error: 'Forbidden!' });

    const timestampFilter: any = Date.now() - time;
    const activity = await Plays.find({
      filter: { queueTimestamp: { $gte: timestampFilter } },
    });
    if (activity.length === 0)
      return res.status(404).json({
        success: false,
        error: 'No activity updates for time window!',
      });

    return res.status(200).json({ success: true, message: activity });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
