import { NextApiRequest, NextApiResponse } from 'next';
import { MongoError } from 'mongodb';
import connectDB from '../../middleware/mongodb';
import Updates from '../../models/Updates';
import Hosts from '../../models/Host';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET')
      throw new Error('Forbidden!', {
        cause: 400,
      });
    // return res
    //     .status(403)
    //     .json({ success: false, error: 'Forbidden!' });

    /**
     * hostName: string identifying the host; hosts.host.shortName value e.g. "atl"
     * time: whole integer in ms; amount of time (in ms) to look backwards for updates
     */
    const hostName = req.query.hostName;
    const time: any = req.query.time ?? 0;
    const type: any = req.query.type;

    if (!hostName)
      throw new Error('Missing query params hostName!', {
        cause: 400,
      });
    // return res.status(400).json({
    //     success: false,
    //     error: 'Missing query params hostName!'
    // });

    const host = await Hosts.findOne({
      shortName: hostName,
    }).catch(e => {
      console.error(e);
      throw new MongoError(e);
    });

    if (!host)
      throw new Error('Host not found!', {
        cause: 404,
      });

    // return res.status(404).json({
    //     success: false,
    //     error: 'Host not found!'
    // });

    const timestampFilter: any = Date.now() - Number(time);
    const updatesFilter: any = {
      timestamp: { $gte: timestampFilter },
      delivered: false,
    };
    const bid = 'bid',
      play = 'play';
    if ([bid, play, 'join'].includes(type)) {
      updatesFilter['type'] = type;
      let playOrHost: any = type === 'join' ? 'host' : 'play';
      updatesFilter[`${playOrHost}.hostId`] = host.hostId;
      if ([bid, play].includes(type)) updatesFilter['play.status'] = 'queued';
    }

    const activity = await Updates.find({
      filter: updatesFilter,
    }).catch(e => {
      console.error(e);
      throw new MongoError(e);
    });

    if (activity.length === 0)
      throw new Error('Activity updates not found in time window!', {
        cause: 404,
      });
    // return res.status(404).json({
    //     success: false,
    //     error: 'No activity updates for time window!'
    // });

    return res.status(200).json({ success: true, message: activity });
  } catch (error: any) {
    return res
      .status(error.cause)
      .json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
