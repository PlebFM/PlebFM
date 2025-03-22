import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middleware/mongodb';
import Hosts, { Host } from '../../models/Host';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Gets list of hosts
  if (req.method === 'GET') {
    const hosts: Host[] = await Hosts.find(req.query);
    return res.status(200).send({ success: true, hosts: hosts });
  }
  // Updates host details
  else if (req.method === 'PATCH') {
    const { spotifyId, shortName, hostName, refreshToken } = req.body;
    const host = await Hosts.findOneAndUpdate(
      { spotifyId },
      { shortName, hostName, hostId: spotifyId, spotifyId, refreshToken },
      { new: true },
    );
    if (host) {
      return res.status(200).json({ success: true, data: host });
    } else {
      return res.status(400).json({ success: false, error: `host not found` });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default connectDB(handler);
