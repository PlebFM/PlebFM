import { NextApiRequest, NextApiResponse } from "next";
import Instances from "../../../models/Instance";


const buildQueue = async (customerId: string | string[] | undefined) => {
  const instances = await Instances.find({ customerId: customerId, status: "queued" })
  const noInstances: Boolean = instances.length === 0
  if (noInstances) return { success: false, error: 'No instances for customerId!' }
  const queue = instances.sort((b: any, c: any) => (b.queueTimestamp < c.queueTimestamp) ? 1 : -1).sort((b: any, c: any) => (b.runningTotal < c.runningTotal) ? 1 : -1)
  return { success: true, queue: queue }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const { customerId } = req.body;
      const post: any = await buildQueue(customerId);
      if (!post.success) return res.status(400).json(post);
      return res.status(200).json(post);
    } else if (req.method === 'GET') {
      const { customerId } = req.query;
      const get: any = await buildQueue(customerId);
      get.queue[0].status = "next"
      if (!get.success) return res.status(400).json(get);
      return res.status(200).json(get);
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
}

export default handler;
