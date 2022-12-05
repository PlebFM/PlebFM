import { NextApiRequest, NextApiResponse } from "next";
import Customers from "../../../models/Customer";
import Users from "../../../models/User";
import Instances, { Instance } from "../../../models/Instance";
import { Bid } from "../../../models/Bid";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { customerName, userId, rHash, songId, bidAmount } = req.body;
    const now: string = Date.now().toString();
    const newBid: Bid = {
      userId: userId,
      bidAmount: bidAmount,
      timestamp: now,
      rHash: rHash,
    }

    const customer = await Customers.findOne({ shortName: customerName })
    if (!customer) return res.status(400).json({ success: false, error: 'Customer not found.' });

    const user = await Users.findOne({ userId: userId })
    if (!user) return res.status(400).json({ success: false, error: 'User not found.' });

    const matchingInstances = await Instances.findOne({ "Bids.rHash": { $eq: rHash } })
    if (matchingInstances) return res.status(400).json({ success: false, error: 'Duplicate bid found.' });

    const instance = await Instances.findOneAndUpdate({ songId: songId }, { $push: { Bids: newBid }, $inc: { runningTotal: bidAmount } })
    if (instance) return res.status(200).json({ success: true, new: false, instance: instance });

    const runningTotal = instance.Bids.reduce((p: any, c: any) => p.bidAmount + c.bidAmount) + bidAmount
    const newInstance: Instance = await Instances.create({
      customerId: customer.id,
      songId: songId,
      status: "queued",
      queueTimestamp: now,
      playedTimestamp: undefined,
      Bids: new Array<Bid>(newBid),
      runningTotal: runningTotal
    })

    return res.status(200).json({ success: true, new: true, instance: newInstance });

  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
}

export default handler;
