import { NextApiRequest, NextApiResponse } from "next";
import Customers from "../../../models/Customer";
import Users from "../../../models/User";
import Instances, { Instance } from "../../../models/Instance";
import { Bid } from "../../../models/Bid";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { customerName, userId, rHash, songId, bidAmount } = req.body;
    console.log(req.body)

    const customer = await Customers.findOne({ shortName: customerName })
    if (!customer) return res.status(400).json({ success: false, error: 'Customer not found.' });
    console.log("customer", customer)
    const user = await Users.findOne({ userId: userId })
    if (!user) return res.status(400).json({ success: false, error: 'User not found.' });
    console.log("user")
    const instances = await Instances.find()
    if (!instances) return res.status(400).json({ success: false, error: 'Fatal: Instances not found.' });
    console.log("instances")
    const matchingBids = instances.filter((i: Instance) => i.Bids.filter((b: Bid) => b.rHash === rHash));
    const bidIsUnique = matchingBids.length === 0;
    if (!bidIsUnique) return res.status(400).json({ success: false, error: 'Bid rHash not unique.' });

    const now = Date.now().toString();
    const songInstance = await Instances.findOne({ songId: songId });
    if (songInstance) return res.status(200).json({ success: true, new: false, instance: songInstance });

    const newInstance = await Instances.create({
      customerId: customer.id,
      songId: songId,
      status: "queued",
      queueTimestamp: now,
      playedTimestamp: undefined,
      Bids: new Array<Bid>({
        userId: userId,
        bidAmount: bidAmount,
        timestamp: now,
        rHash: rHash,
      }),
    })

    return res.status(200).json({ success: true, new: true, instance: newInstance });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
}

export default handler;