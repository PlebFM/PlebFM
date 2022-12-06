import { NextApiRequest, NextApiResponse } from "next";
import Instances from "../../../models/Instance";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { customerId, next } = req.query;
    const instances = await Instances.find({ customerId: customerId, status: "queued" })
    const noInstances: Boolean = instances.length === 0
    if (noInstances) return res.status(400).json({ success: false, error: 'No instances for customerId!' })
    const queue = instances.sort((b: any, c: any) => (b.queueTimestamp < c.queueTimestamp) ? 1 : -1).sort((b: any, c: any) => (b.runningTotal < c.runningTotal) ? 1 : -1)
    if (next && next === 'true') queue[0].status = "next"
    return res.status(200).json({ success: true, queue: queue });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
}

export default handler;
