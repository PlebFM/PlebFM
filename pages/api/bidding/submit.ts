import { NextApiRequest, NextApiResponse } from "next";
import Customers from "../../../models/Customer";
import Users from "../../../models/User";
import Instances, { Instance } from "../../../models/Instance";
import { Bid } from "../../../models/Bid";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      console.error(req.body);
      const { customerName, userId, rHash, songId, bidAmount } = req.body;
      const now: string = Date.now().toString();
      const newBid: Bid = {
        userId: userId,
        bidAmount: bidAmount,
        timestamp: now,
        rHash: rHash,
      }
      console.error(req.body)

      const customer = await Customers.findOne({ shortName: customerName });
      if (!customer) return res.status(400).json({ success: false, error: `Customer not found.` });
      console.error(customer)

      // const user = await Users.findOne({ userId: userId });
      // if (!user) return res.status(400).json({ success: false, error: 'User not found.' });
      // console.error(user)

      const matchingInstances = await Instances.findOne({ "Bids.rHash": { $eq: rHash } })
      if (matchingInstances) return res.status(400).json({ success: false, error: 'Duplicate bid found.' });
      console.error(matchingInstances)

      const instance = await Instances.findOneAndUpdate({ songId: songId }, { $push: { Bids: newBid }, $inc: { runningTotal: bidAmount } }).catch(_ => {});
      if (instance) return res.status(200).json({ success: true, new: false, instance: instance });

      const runningTotal = (instance?.Bids?.reduce((p: any, c: any) => p.bidAmount + c.bidAmount).catch(_ => {}) ?? 0 + bidAmount
      const newInstance: Instance = await Instances.create({
        customerId: customer.id,
        songId: songId,
        status: "queued",
        queueTimestamp: now,
        Bids: new Array<Bid>(newBid),
        runningTotal: runningTotal
      })

      return res.status(200).json({ success: true, new: true, instance: newInstance });
    }

  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export default handler;
