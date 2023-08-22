import { MongoError } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';
import Hosts, { Host } from '../../../models/Host';
import Plays, { Play } from '../../../models/Play';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const { hostShortName, _limit, userId } = req.query;
      const next = false;
      const limit = parseInt((_limit as string) ?? '10');
      if (!hostShortName) {
        return res.status(404).json({
          success: false,
          message: 'Expected query param hostShortName!',
        });
      }
      // Lookup host by shortname
      const host: Host = await Hosts.findOne({
        shortName: hostShortName,
      }).catch(e => {
        console.error(e);
        throw new Error(e);
      });

      // If not host exists, return error
      if (!host)
        return res.status(404).json({
          success: false,
          message: `No host found for hostShortName!`,
        });
      // Query Plays: Get play objs where hostId = host.hostId & status = queued
      // sort by highest runningTotal and oldest queueTimestamp if ties occur
      const filter = userId
        ? { hostId: host.hostId, 'bids.user.userId': userId }
        : { hostId: host.hostId, status: ['queued', 'next', 'playing'] };
      let sortedPlays: Array<Play> = await Plays.find(
        filter,
        {},
        { options: { limit: limit } },
      )
        .sort({ runningTotal: -1, queueTimestamp: 1 })
        .catch(e => {
          console.error(e);
          throw new Error(e);
        });

      // Plays.find returns a list of results. If no results found, list will be empty []
      // Check for response emptiness. Return error if plays is empty list
      if (sortedPlays.length === 0)
        return res.status(200).json({
          success: true,
          queue: [],
        });

      // Use "next=true" query param to toggle updating the queue
      if (next === 'true') {
        // Grab first play obj in queue => play obj w/ highest runningTotal and oldest timestamp
        const winner = sortedPlays[0];
        // Query Plays: Get leading play object from db and update status to "next"
        // Since playId is a globally unique cuid, should return 1 play obj
        const play: Play = await Plays.findOneAndUpdate(
          { playId: winner.playId },
          { $set: { status: 'next' } },
        ).catch(e => {
          console.error(e);
          throw new MongoError(e);
        });

        // If nothing returned, then nothing was updated and thus nothing was found, return error
        if (!play)
          return res.status(404).json({
            success: false,
            message: `No Play found for host with that playId!`,
          });

        // Query Plays: Get all Play objects where hostId = host.hostId
        // Include all statuses, sort by highest runningTotal and oldest queueTimestamp if ties occur
        sortedPlays = await Plays.find(
          { hostId: host.hostId },
          {},
          { options: { limit: limit } },
        )
          .sort({ runningTotal: -1, queueTimestamp: 1 })
          .catch(e => {
            console.error(e);
            throw new MongoError(e);
          });
        // If no Plays exist with that hostId, somethings wrong, return error
        if (sortedPlays.length === 0)
          return res.status(404).json({
            success: false,
            message: `No Plays found for host!`,
          });
      }
      return res.status(200).json({ success: true, queue: sortedPlays });
    } else if (req.method === 'POST') {
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default connectDB(handler);
