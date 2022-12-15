import { NextApiRequest, NextApiResponse } from "next";
import Instances from "../../../models/Instance";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { shortName, next } = req.query;
    /*
      TODO: question - shouldn't we use customerId for lookup?
      const { customerId, next } = req.query;
      Instances = collection of songs with metadata and Bids
      const instances = await Instances.find({ customerId: customerId, status: "queued" })
      If no instances exist with that customerId and status, return error
     */
    const instances = await Instances.find({ shortName: shortName, status: "queued" })
    const noInstances: Boolean = instances.length === 0
    if (noInstances) return res.status(400).json({ success: false, error: `No instances for shortName=${shortName}!` })
    // queue = collection of Instances sorted by timestamp and runningTotal
    let queue = instances.sort((b: any, c: any) => (b.queueTimestamp < c.queueTimestamp) ? 1 : -1).sort((b: any, c: any) => (b.runningTotal < c.runningTotal) ? 1 : -1)
    // Next = query param to toggle updating the queue, if exists and is true, update leadingInstance status to "next"
    if (next && next === "true") {
      // leadingInstance = song with highest sum of all bidAmounts in Bids array
      const leadingInstance = queue[0]
      // set leadingInstance status to "next"
      leadingInstance.status = "next"
      // find the instance to update based on customerId & the instance id, update the doc in the instances collection to be this new doc with status = "next"
      const instance = await Instances.findOneAndUpdate({ shortName: shortName, id: leadingInstance.id }, { $set: { leadingInstance } })
      // if nothing returned, then nothing was updated and thus nothing was found, return error
      if (!instance) return res.status(400).json({ success: false, error: `No instance found for shortName=${shortName} and instanceId=${leadingInstance.id}!` })
      // Repull instances including updated instance
      const instances = await Instances.find({ shortName: shortName });
      // If no instances exist with that shortName, return error
      const noInstances: Boolean = instances.length === 0
      if (noInstances) return res.status(400).json({ success: false, error: `No instances for shortName=${shortName}!` })
      // reset queue to the new updated list of instances sorted again by timestamp and runningTotal
      queue = instances.sort((b: any, c: any) => (b.queueTimestamp < c.queueTimestamp) ? 1 : -1).sort((b: any, c: any) => (b.runningTotal < c.runningTotal) ? 1 : -1)
    }

    return res.status(200).json({ success: true, queue: queue });

  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
}

export default handler;
