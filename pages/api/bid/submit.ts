import { NextApiRequest, NextApiResponse } from 'next';
import cuid from 'cuid';
import Hosts from '../../../models/Host';
import Users from '../../../models/User';
import Plays, { Play } from '../../../models/Play';
import { Bid } from '../../../models/Bid';
import connectDB from '../../../middleware/mongodb';
import { MongoError } from 'mongodb';
import Updates from '../../../models/Updates';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') throw new Error('Forbidden!', { cause: 403 });
    // return res
    //     .status(403)
    //     .json({ success: false, error: 'Forbidden!' });

    const { hostName, userId, rHash, songId, bidAmount } = req.body;
    const { playId } = req.query;
    const isNew = req.query.isNew ?? true;
    const playIsNew: boolean = Boolean(isNew);
    const noPlayId: boolean = !playId;

    if (!playIsNew && noPlayId)
      throw new Error('Must pass playId if play isNew=false!', {
        cause: 400,
      });
    // return res.status(400).json({
    //     success: false,
    //     message: 'Must pass playId if bid is not new!'
    // });

    const now: Number = Date.now();

    const host = await Hosts.findOne({ shortName: hostName }).catch(e => {
      console.error(e);
      throw new MongoError(e);
    });
    if (!host) {
      console.error(host);
      throw new Error('Host not found!', {
        cause: 404,
      });
    }
    // return res
    //     .status(404)
    //     .json({ success: false, error: 'Host not found!' });

    const user = await Users.findOne({ userId: userId }).catch(e => {
      console.error(e);
      throw new MongoError(e);
    });

    if (!user) {
      console.error(user);
      throw new Error('User not found!', {
        cause: 404,
      });
    }
    // return res
    //     .status(404)
    //     .json({ success: false, error: 'User not found!' });

    const rHashDuplicated = await Plays.findOne({
      'bids.rHash': { $eq: rHash },
    }).catch(e => {
      console.error(e);
      throw new MongoError(e);
    });

    if (rHashDuplicated) {
      console.error(user);
      throw new Error('Duplicate rHash found!', {
        cause: 500,
      });
    }
    // return res
    //     .status(400)
    //     .json({ success: false, error: 'Duplicate rHash found!' });

    const newBid: Bid = {
        bidId: cuid(),
        user: user,
        bidAmount: bidAmount,
        timestamp: now,
        rHash: rHash,
      },
      newPlay: Play = {
        playId: cuid(),
        hostId: host.hostId,
        songId: songId,
        status: 'queued',
        queueTimestamp: now,
        playedTimestamp: undefined,
        bids: new Array<Bid>(newBid),
        runningTotal: bidAmount,
      };

    let result: Play,
      errorMessage: string,
      responseMessage: any = { activityUpdate: true, new: true },
      activityUpdate: any = {
        type: 'play',
        delivered: false,
        play: undefined,
        timestamp: now,
      };

    if (!playIsNew) {
      result = await Plays.findOneAndUpdate(
        { playId: playId },
        { $push: { bids: newBid }, $inc: { runningTotal: bidAmount } },
        { new: true },
      ).catch(e => {
        console.error(e);
        throw new MongoError(e);
      });
      errorMessage = 'Play not found!';
      activityUpdate.type = 'bid';
      responseMessage.new = false;
    } else {
      result = await Plays.create(newPlay).catch(e => {
        console.error(e);
        throw new MongoError(e);
      });
      errorMessage = 'Play not created!';
    }

    if (!result) {
      console.error(result);
      throw new Error(errorMessage, { cause: 404 });
    }
    // return res.status(404).json({
    //     success: false,
    //     error: errorMessage
    // });

    activityUpdate.play = result;
    const createUpdate = await Updates.create(activityUpdate).catch(e => {
      console.error('Failed to create new activity update!', e);
    });
    if (!createUpdate) responseMessage.activityUpdate = false;

    return res.status(200).json({
      success: true,
      message: { ...responseMessage, play: result },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export default connectDB(handler);
