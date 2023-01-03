import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middleware/mongodb";
import Hosts, { Host } from '../../../models/Host'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { shortName } = req.query;
    // Gets list of hosts
    if (req.method === 'GET') {
      const host = await Hosts.findOne({ shortName: shortName });
      if (!host)
        return res.status(400).json({ success: false, error: 'Host not found.' });

      return res.status(200).json({ success: true, host: host });

      // Adds new host
    } else if (req.method === 'POST') {
      const { hostName, shortName, hostId, refreshToken } = req.body;
      if (!hostName) res.status(400).json({ error: `hostName must be present` });
      const host: Host = {
        hostName: hostName,
        shortName: shortName,
        hostId: hostId,
        spotifyRefreshToken: refreshToken
      }
      const result = await Hosts.create(host);
      res.status(200).json({ success: true, host: result });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'host lookup failed' });
  }
};

export default connectDB(handler);