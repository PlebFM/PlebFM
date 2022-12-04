import { NextApiRequest, NextApiResponse } from "next";
import Instances, { Instance } from "../../../models/Instance";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  /* POST 
  Bid = {
        userId,
        bidAmount,
        timestamp,
        rHash,
      }
  */
  /**
   Instance = {
      customerId: string,
      songId: string,
      status: string,
      queueTimestamp: string
      playedTimestamp: string
      Bids: object
  }
  */
  // check if user exists
  // check if r_hash is unique across all instances
  const { customerId, songId, userId, bidAmount, timestamp, rHash } = req.body;
  // if (!customerName) res.status(400).json({ error: `customerName must be present` });
  // const instance: Instance = {
  //   customerName: customerName,
  //   shortName: shortName
  // }
  const result = await Instances.find({ id: customerId });
  const isEmpty = result.length === 0
  if(!isEmpty) return res.status(400).json({success: false, error: 'Customer not found.'});
  res.status(200).json({ success: true, customer: "" });
}

export default handler;