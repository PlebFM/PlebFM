import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middleware/mongodb";
import Hosts from "../../../models/Host";
import Plays, { Play } from "../../../models/Play";

const sortQueue = async (unsorted: Array<Play>) => {
  try {
    console.log("unsorted", unsorted)
    return unsorted.sort((prev: any, curr: any) => (prev.queueTimestamp < curr.queueTimestamp && prev.runningTotal < curr.runningTotal) ? 1 : -1)
  } catch (error: any) {
    throw new Error(error);
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { hostShortName, next } = req.query;
    // Lookup host by shortname
    const host: any = await Hosts.findOne({ shortName: "atl" }).catch(e => { console.error(e); throw new Error(e) });
    // If not host exists, return error
    if (!host) return res.status(400).json({ success: false, error: `No host for given host shortName ${hostShortName}!` })
    // Query Plays where hostId = host.hostId & status = queued
    const plays = await Plays.find({ hostId: host.hostId, status: "queued" }).catch(e => { console.error(e); throw new Error(e) });
    // Plays.find returns a list of results; if no results found, list will be empty []
    // Check for response emptiness
    const noPlays: Boolean = plays.length === 0;
    // Return error if plays is empty list
    if (noPlays) return res.status(400).json({ success: false, error: `No queued Plays exist for host ${hostShortName}!` })
    // Sort list of play objects by timestamp and runningTotal
    // Returns list of plays in order of highest to lowest runningTotal, ties go to the Play with the older timestamp
    let sortedQueue = await sortQueue(plays).catch(e => { console.error(e); throw new Error(e) });

    // User next uery param to toggle updating the queue
    // If next exists and is true, update leadingInstance in sorted queue to status = "next"
    if (Boolean(next)) {
      // leadingInstance is the song with highest sum of all bidAmounts in Bids array and oldest timestamp
      const queueLeader = sortedQueue.shift()
      // const queueLeader = sortedQueue[0]
      // set queueLeader status to "next"
      queueLeader.status = "next"
      // Query Plays where shortName = hostShortName & playId = queueLeader.id
      // Update the Play in the Plays collection to new object with status = "next"
      const play = await Plays.findOneAndUpdate({ hostId: host.hostId, playId: queueLeader.playId }, { $set: { queueLeader } }).catch(e => { console.error(e); throw new Error(e) });
      // If nothing returned, then nothing was updated and thus nothing was found, return error
      if (!play) return res.status(400).json({ success: false, error: `No Play found with playId ${queueLeader.id} for host ${hostShortName}!` })

      // Repull all Play objects where shortname = hostShortName including updated instance
      const plays = await Plays.find({ hostId: host.hostId }, { sort: { runningTotal: -1, queueTimestamp: 1 } }).catch(e => { console.error(e); throw new Error(e) });;
      // If no Plays exist with that shortName, somethings wrong, return error
      const noPlays: Boolean = plays.length === 0
      if (noPlays) return res.status(400).json({ success: false, error: `No Plays for host ${hostShortName}!` })

      // reset queue to the new updated list of Plays sorted again by timestamp and runningTotal
      sortedQueue = await sortQueue(Plays).catch(e => { console.error(e); throw new Error(e) });
    }

    return res.status(200).json({ success: true, queue: sortedQueue });

  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export default connectDB(handler);
