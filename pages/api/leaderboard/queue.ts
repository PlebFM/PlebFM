import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middleware/mongodb";
import Hosts from "../../../models/Host";
import Plays, { Play } from "../../../models/Play";

// const sortQueue = async (unsorted: Array<Play>) => {
//   try {
//     console.log("unsorted", unsorted)
//     return unsorted.sort((prev: any, curr: any) => (prev.queueTimestamp < curr.queueTimestamp) ? 1 : -1).sort((prev: any, curr: any) => (prev.runningTotal < curr.runningTotal) ? 1 : -1);
//   } catch (error: any) {
//     throw new Error(error);
//   }
// }

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { hostShortName, next } = req.query;
    // Lookup host by shortname
    const host: any = await Hosts.findOne({ shortName: "atl" }).catch(e => { console.error(e); throw new Error(e) });
    // If not host exists, return error
    if (!host) return res.status(400).json({ success: false, error: `No host for given host shortName ${hostShortName}!` })
    // Query Plays: Get play objs where hostId = host.hostId & status = queued
    let sortedPlays = await Plays.find({ hostId: host.hostId, status: "queued" }).sort({ runningTotal: -1, queueTimestamp: 1 }).catch(e => { console.error(e); throw new Error(e) });
    // Plays.find returns a list of results; if no results found, list will be empty []
    // Check for response emptiness
    const noPlays: Boolean = sortedPlays.length === 0;
    // Return error if plays is empty list
    if (noPlays) return res.status(400).json({ success: false, error: `No queued Plays exist for host ${hostShortName}, hostId ${host.hostId}!` })
    // Sort list of play objects by timestamp and runningTotal
    // Returns list of plays in order of highest to lowest runningTotal, ties go to the Play with the older timestamp
    // let sortedQueue = await sortQueue(plays).catch(e => { console.error(e); throw new Error(e) });

    // User next uery param to toggle updating the queue
    // If next exists and is true, update leadingInstance in sorted queue to status = "next"
    if (next === "true") {
      // Grab first play obj in queue
      // queueLeader is the play obj w/ highest runningTotal and oldest timestamp
      const queueLeader = sortedPlays[0]
      // Query Plays: Get leading play object from db and update status to "next"
      // Since playId is a globally unique cuid, should return 1 play obj
      const play = await Plays.findOneAndUpdate({ playId: queueLeader.playId }, { $set: { status: "next" } }).catch(e => { console.error(e); throw new Error(e) });
      // If nothing returned, then nothing was updated and thus nothing was found, return error
      if (!play) return res.status(400).json({ success: false, error: `No Play found with playId ${queueLeader.playId} for host ${hostShortName}, hostId ${host.hostId}!` })
      // Repull all Play objects where hostId = host.hostId, include all statuses, sort descending by runningTotal and ascensing by queueTimestamp
      sortedPlays = await Plays.find({ hostId: host.hostId }).sort({ runningTotal: -1, queueTimestamp: 1 }).catch(e => { console.error(e); throw new Error(e) });
      // If no Plays exist with that shortName, somethings wrong, return error
      const noPlays: Boolean = sortedPlays.length === 0
      if (noPlays) return res.status(400).json({ success: false, error: `No Plays found for host ${hostShortName}, hostId ${host.hostId}!` })
    }

    return res.status(200).json({ success: true, queue: sortedPlays });

  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export default connectDB(handler);
