import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import Feed from '../../../models/Feed';
import Hosts from '../../../models/Host';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { type, hostShortName, songId, userId, timestamp } = req.body;
    console.log('req.body', req.body);
    const host = await Hosts.findOne({ shortName: hostShortName });
    console.log('host', host);
    return;
    if (!host)
      return res.status(404).json({
        success: false,
        message: `Host not found for shortName ${hostShortName}`,
      });
    const updateDoc: any = {
      type: type,
      hostId: host.hostId,
      userId: userId,
      timestamp: `${timestamp}`,
    };
    if (songId) updateDoc.songId = songId;
    const update = await Feed.create(updateDoc);
    if (!update)
      return res.status(500).json({
        success: false,
        message: `Failed to create new Update in Feed!`,
      });
    return res.status(200).json({
      success: true,
      message: update,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
