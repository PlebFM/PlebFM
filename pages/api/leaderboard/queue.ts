import { NextApiRequest, NextApiResponse } from "next";
import Customers from "../../../models/Customer";
import Users from "../../../models/User";
import Instances, { Instance } from "../../../models/Instance";
import { Bid } from "../../../models/Bid";

/**
 * 
 * @param req
 * @param res
 * @returns new Queue: sorted(sum(Instance.Bids.bidAmount))
 * query db for Instances by customerId
 */

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { customerId } = req.body;
    const instances = await Instances.find({ customerId: customerId, status: "queued" })
    const noInstances: Boolean = instances.length === 0
    if (noInstances) return res.status(400).json({ success: false, error: 'Fatal: Instances not found!' });
    const queue = instances.sort((b: any, c: any) => (b.queueTimestamp < c.queueTimestamp) ? 1 : -1).sort((b: any, c: any) => (b.runningTotal < c.runningTotal) ? 1 : -1)
    return res.status(200).json({ success: true, queue: queue });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
}

export default handler;
