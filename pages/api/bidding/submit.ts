import { NextApiRequest, NextApiResponse } from "next";
import cuid from "cuid";
import Customers from "../../../models/Customer";
import Users from "../../../models/User";
import Instances, { Instance } from "../../../models/Instance";
import { Bid } from "../../../models/Bid";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') return res.status(403).json({ success: false, error: 'Forbidden' });

    const { customerName, userId, rHash, songId, bidAmount } = req.body;
    const now: string = Date.now().toString();

    const customer = await Customers.findOne({ shortName: customerName });
    if (!customer) return res.status(400).json({ success: false, error: `Customer not found.` });
    console.error(customer)

    const user = await Users.findOne({ userId: userId });
    if (!user) return res.status(400).json({ success: false, error: 'User not found.' });
    console.error(user)

    const newBid: Bid = {
      user: user,
      bidAmount: bidAmount,
      timestamp: now,
      rHash: rHash,
    }

    const matchingInstances = await Instances.findOne({ "bids.rHash": { $eq: rHash } }).catch(e => { console.error(e); throw new Error(e) });
    if (matchingInstances) return res.status(400).json({ success: false, error: 'Duplicate bid found.' })

    const instance = await Instances.findOneAndUpdate({ songId: songId }, { $push: { bids: newBid }, $inc: { runningTotal: bidAmount } }).catch((e: string | undefined) => { console.error(e); throw new Error(e) });
    if (instance) return res.status(200).json({ success: true, new: false, instance: instance });

    const runningTotal = (instance.bids.reduce((prev: any, curr: any) => prev.bidAmount + curr.bidAmount) ?? 0 + bidAmount).catch((e: any) => { console.error(e); throw new Error(e) });
    const newInstance: Instance = await Instances.create({
      id: cuid(),
      customerId: customer.id,
      songId: songId,
      status: "queued",
      queueTimestamp: now,
      playedTimestamp: undefined,
      bids: new Array<Bid>(newBid),
      runningTotal: runningTotal
    }).catch((e: string | undefined) => { console.error(e); throw new Error(e) });

    return res.status(200).json({ success: true, new: true, instance: newInstance });

  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export default handler;
